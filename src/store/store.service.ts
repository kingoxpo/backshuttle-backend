import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput } from "./dtos/category.dto";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { DeleteStoreInput, DeleteStoreOutput } from "./dtos/delete-store.dto";
import { EditStoreInput, EditStoreOutput } from "./dtos/edit-store.dto";
import { Category } from "./entities/category.entity";
import { Store } from "./entities/store.entity";
import { CategoryRepository } from "src/store/repositories/category.repository";
import { StoresInput, StoresOutput } from "./dtos/stores.dto";



@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    private readonly categories: CategoryRepository,
    ) {}

    async createStore(
      owner: User,
      createStoreInput: CreateStoreInput,
    ): Promise<CreateStoreOutput> {
      try {
      const newStore = this.stores.create(createStoreInput);      
      newStore.owner = owner;
      const category = await this.categories.getOrCreate(
        createStoreInput.categoryName,
      );
      newStore.category = category;        
      await this.stores.save(newStore);
      return {
        ok: true,
      }
    } catch(error) {
      console.log(error);
      return {
        ok: false,
        error: '스토어를 만들 수 없습니다'
      }
    }
  }

  async editStore(
    owner: User,
    editStoreInput: EditStoreInput,
  ): Promise<EditStoreOutput> {
    try {
      const store = await this.stores.findOne(
        editStoreInput.storeId,
      );
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.'
        };
      }  
      if (owner.id !== store.ownerId) {
        return {
          ok:false,
          error: '내 스토어만 수정할 수 있습니다.'
        };
      }
      let category: Category = null;
      if(editStoreInput.categoryName){        
        category = await this.categories.getOrCreate(
          editStoreInput.categoryName,
        );
      }
      await this.stores.save([
        {
          id: editStoreInput.storeId,
          ...editStoreInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      }
    } catch {
      return {
        ok:false,
        error: '스토어를 수정할 수 없습니다.'
      };
    };
  };

  async deleteStore(
    owner: User,
    {storeId}: DeleteStoreInput,
  ): Promise<DeleteStoreOutput> {
    try {
      const store = await this.stores.findOne(
        storeId,
      );
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.'
        };
      }  
      if (owner.id !== store.ownerId) {
        return {
          ok:false,
          error: '내 스토어만 삭제할 수 있습니다.'
        };
      }
      await this.stores.delete(storeId)
      return {
        ok: true,
      };
    } catch {
      return {
        ok:false,
        error: '스토어를 삭제할 수 없습니다.'
      };
    };
  };

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      }

    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.'
      }
    }
  }
  countStore(category: Category) {
    return this.stores.count({category});
  }

  async findCategoryBySlug({ slug, page }: CategoryInput){
    try{
      const category = await this.categories.findOne({ slug });
      if(!category){
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다.'
        };
      }
      const stores = await this.stores.find({
        where: {
          category,
        },
        take: 10,
        skip: (page - 1) * 10,
      });
      category.stores = stores;
      const totalResult = await this.countStore(category)
      return {
        ok: true,
        stores,
        category,
        totalPages: Math.ceil(totalResult / 10)
      }
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.',
      }
    }
  }
  
  async allStores({ page }: StoresInput): Promise<StoresOutput> {
    try {
      const [stores, totalResult] = await this.stores.findAndCount({
        take: 10,
        skip: (page -1) * 10,
      });
      return {
        ok: true,
        results: stores,
        totalPages: Math.ceil(totalResult / 10),
        totalResult,
      };
    } catch {
      return {
        ok: false,
        error: '스토어를 불러올 수 없습니다.'
      }
    }
  }
};

