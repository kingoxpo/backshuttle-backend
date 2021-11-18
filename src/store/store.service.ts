import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { Category } from "./entities/category.entity";
import { Store } from "./entities/store.entity";



@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    ) {}

    async createStore(
      owner: User,
      createStoreInput: CreateStoreInput,
    ): Promise<CreateStoreOutput> {
      try {
      const newStore = this.stores.create(createStoreInput);      
      newStore.owner = owner;
      const categoryName = createStoreInput.categoryName.trim().toLowerCase()
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });
      if(!category){
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
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
}