import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { ILike, Like } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { DeleteStoreOutput } from "./dtos/delete-store.dto";
import { EditStoreInput, EditStoreOutput } from "./dtos/edit-store.dto";
import { Category } from "./entities/category.entity";
import { Store } from "./entities/store.entity";
import { CategoryRepository } from "src/store/repositories/category.repository";
import { StoresInput, StoresOutput } from "./dtos/stores.dto";
import { StoreInput, StoreOutput } from "./dtos/store.dto";
import { SearchStoreInput, SearchStoreOutput } from "./dtos/search-store.dto";
import { StoreRepository } from "./repositories/store.repository";



@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: StoreRepository,
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
      const checkStore = await this.stores.checkStore(
        owner.id,
        editStoreInput.storeId,
      );
      if (!checkStore.ok) {
        return {
          ...checkStore,
        }
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
    owner,
    { storeId },
  ): Promise<DeleteStoreOutput> {
    try {
      const checkStore = await this.stores.checkStore(
        owner.id,
        storeId,
      );
      if (!checkStore.ok) {
        return {
          ...checkStore,         
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

  countStores(category: Category): Promise<number> {
    return this.stores.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
   }: CategoryInput): Promise<CategoryOutput>{
    try{
      const category = await this.categories.findOne({ slug });
      if(!category){
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다.'
        };
      }
      const { stores } = await this.stores.findPagination(page, {  
       category,
      });

      category.stores = stores;

      const totalResults = await this.countStores(category)

      return {
        ok: true,        
        stores,
        category,
        totalPages: Math.ceil(totalResults / 10),
        totalResults,
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
      return await this.stores.findAndCountPagination(page);      
    } catch {
      return {
        ok: false,
        error: '스토어를 불러올 수 없습니다.'
      };
    }
  }


  async findStoreById({
    storeId,
  }: StoreInput): Promise<StoreOutput> {
    try {
      const store = await this.stores.findOne(storeId);
      if (!store){
        return {
          ok: false,
          error:"스토어를 찾을 수 없습니다."
        };
      }
      return {
        ok: true,
        store,
      };
      
    } catch {
      return {
       ok: false,
       error: "스토어를 불러올 수 없습니다.",
      };
    }
  }

  async searchStoreByName({
    query,
    page,
  }: SearchStoreInput): Promise<SearchStoreOutput> {
    try {
      return await this.stores.findAndCountPagination(page, {
        name: Like(`%${query}%`)
      });      
    } catch {
      console.log(query, page, '실패결과')
      return {
        ok: false,
        error: "스토어를 검색할 수 없습니다.",
      }
    }
  }  
};

