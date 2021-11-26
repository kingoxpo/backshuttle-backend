import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { DeleteStoreInput, DeleteStoreOutput } from "./dtos/delete-store.dto";
import { EditStoreInput, EditStoreOutput } from "./dtos/edit-store.dto";
import { Category } from "./entities/category.entity";
import { Store } from "./entities/store.entity";
import { StoreService } from "./store.service";

@Resolver(of => Store)
export class StoreResolver{
  constructor(private readonly storeService: StoreService) {}
  
  @Mutation(returns => CreateStoreOutput)
  @Role(['Owner'])  
  async createStore(
    @AuthUser() authUser: User,
    @Args('input') createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    return this.storeService.createStore(
      authUser,
      createStoreInput,
    );  
  }

  @Mutation(returns => EditStoreOutput)
  @Role(['Owner'])
  editStore(    
    @AuthUser() owner: User,
    @Args('input') editStoreInput: EditStoreInput,
  ): Promise<EditStoreOutput> {
    return this.storeService.editStore(owner, editStoreInput);
  };

  @Mutation(returns => DeleteStoreOutput)
  @Role(['Owner'])
  deleteStore(    
    @AuthUser() owner: User,
    @Args('input') deleteStoreInput: DeleteStoreInput,
  ): Promise<DeleteStoreOutput> {
    return this.storeService.deleteStore(owner, deleteStoreInput);
  };
}

@Resolver(of => Category)
export class CategoryResolver{
  constructor(private readonly storeService: StoreService) {}

  @ResolveField(type => Int)
  storeCount(@Parent() category: Category): Promise<number> {
    return this.storeService.countStore(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.storeService.allCategories();
  }
  @Query(type => CategoryOutput)
  category(@Args() categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.storeService.findCategoryBySlug(categoryInput);
  
  }
}