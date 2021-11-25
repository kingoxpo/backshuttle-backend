import { Int, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AllCategoriesOutput } from "src/store/dtos/all-categories.dto";
import { Category } from "src/store/entities/category.entity";
import { StoreService } from "src/store/store.service";

@Resolver(of => Category)
export class CategoryResolver{
  constructor(private readonly storeService: StoreService) {}

  @ResolveField(type => Int)
  storeCount(): number {
    return 1;
  }

  @Query(type => AllCategoriesOutput)

  allCategories(): Promise<AllCategoriesOutput>{
    return this.storeService.allCategories();
  }
  
}