import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AllCategoriesOutput } from "src/store/dtos/all-categories.dto";
import { Category } from "src/store/entities/category.entity";
import { Store } from "src/store/entities/store.entity";
import { CategoryRepository } from "src/store/repositories/category.repository";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    private readonly categories: CategoryRepository,
    ) {}


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
}