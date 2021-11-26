import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AllCategoriesOutput } from "src/categories/dtos/all-categories.dto";
import { Category } from "src/store/entities/category.entity";
import { Store } from "src/store/entities/store.entity";
import { CategoryRepository } from "src/store/repositories/category.repository";
import { Repository } from "typeorm";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";

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
    return this.stores.count({ category });
  }

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne(
        { slug },
        { relations: ['stores'] },
      );
      if (!category) {
        return {
          ok: false,
          error: "카테고리를 찾을 수 없습니다."
        };        
      }
      return {
        ok: true,
        category,
      };
    } catch {
      return {
        ok: false,
        error: "카테고리를 불러올 수 없습니다."
      }
    }   
  }
}