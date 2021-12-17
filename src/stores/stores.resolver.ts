import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import {
  DeleteProductInput,
  DeleteProductOutput,
} from './dtos/delete-product.dto';
import { DeleteStoreInput, DeleteStoreOutput } from './dtos/delete-store.dto';
import { EditProductInput, EditProductOutput } from './dtos/edit-product.dto';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';
import { SearchStoreInput, SearchStoreOutput } from './dtos/search-store.dto';
import { StoreInput, StoreOutput } from './dtos/store.dto';
import { StoresInput, StoresOutput } from './dtos/stores.dto';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Store } from './entities/store.entity';
import { StoreService } from './stores.service';

@Resolver((of) => Store)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Mutation((returns) => CreateStoreOutput)
  @Role(['Owner'])
  createStore(
    @AuthUser() owner: User,
    @Args('input') createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    return this.storeService.createStore(owner, createStoreInput);
  }

  @Mutation((returns) => EditStoreOutput)
  @Role(['Owner'])
  editStore(
    @AuthUser() owner: User,
    @Args('input') editStoreInput: EditStoreInput,
  ): Promise<EditStoreOutput> {
    return this.storeService.editStore(owner, editStoreInput);
  }

  @Mutation((returns) => DeleteStoreOutput)
  @Role(['Owner'])
  deleteStore(
    @AuthUser() owner: User,
    @Args('input') deleteStoreInput: DeleteStoreInput,
  ): Promise<DeleteStoreOutput> {
    return this.storeService.deleteStore(owner, deleteStoreInput);
  }

  @Query((returns) => StoresOutput)
  @Role(['Any'])
  stores(@Args('input') storesInput: StoresInput): Promise<StoresOutput> {
    return this.storeService.allStores(storesInput);
  }

  @Query((returns) => StoreOutput)
  @Role(['Any'])
  store(@Args('input') storeInput: StoreInput): Promise<StoreOutput> {
    return this.storeService.findStoreById(storeInput);
  }

  @Query((returns) => SearchStoreOutput)
  @Role(['Any'])
  searchStore(
    @Args('input') serchStoreInput: SearchStoreInput,
  ): Promise<SearchStoreOutput> {
    return this.storeService.searchStoreByName(serchStoreInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly storeService: StoreService) {}

  @ResolveField((type) => Int)
  storeCount(@Parent() category: Category): Promise<number> {
    return this.storeService.countStores(category);
  }

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.storeService.allCategories();
  }
  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.storeService.findCategoryBySlug(categoryInput);
  }
}

@Resolver((of) => Product)
export class ProductResolver {
  constructor(private readonly storeService: StoreService) {}

  @Mutation((returns) => CreateProductOutput)
  @Role(['Owner'])
  createProduct(
    @AuthUser() owner: User,
    @Args('input') createProductInput: CreateProductInput,
  ): Promise<CreateProductOutput> {
    return this.storeService.createProduct(owner, createProductInput);
  }

  @Mutation((returns) => EditProductOutput)
  @Role(['Owner'])
  editProduct(
    @AuthUser() owner: User,
    @Args('input') editProductInpit: EditProductInput,
  ): Promise<EditProductOutput> {
    return this.storeService.editProduct(owner, editProductInpit);
  }

  @Mutation((returns) => DeleteProductOutput)
  @Role(['Owner'])
  deleteProduct(
    @AuthUser() owner: User,
    @Args('input') deleteProductInput: DeleteProductInput,
  ): Promise<DeleteProductOutput> {
    return this.storeService.deleteProduct(owner, deleteProductInput);
  }
}
