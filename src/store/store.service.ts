import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { EditStoreInput, EditStoreOutput } from "./dtos/edit-store.dto";
import { Category } from "./entities/category.entity";
import { Store } from "./entities/store.entity";
import { CategoryRepository } from "./repositories/category.repository";



@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    private readonly categories: CategoryRepository,
    ) {}


    async getOrCreate(
      name:string
    ): Promise<Category> {
      const categoryName = name.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName })
        );
      }
      return category;
    }


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
};
