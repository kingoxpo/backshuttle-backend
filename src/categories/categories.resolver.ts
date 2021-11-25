import { Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AllCategoriesOutput } from "src/store/dtos/all-categories.dto";
import { Category } from "src/store/entities/category.entity";
import { CategoryService } from "./categories.service";

@Resolver(of => Category)
export class CategoryResolver{
  constructor(private readonly categoryService: CategoryService) {}

  @ResolveField(type => Int)
  storeCount(@Parent() category: Category): Promise<number> {
    console.log(category)
    return this.categoryService.countStore(category);
  }

  @Query(type => AllCategoriesOutput)  

  allCategories(): Promise<AllCategoriesOutput> {
    return this.categoryService.allCategories();
  }
  
}