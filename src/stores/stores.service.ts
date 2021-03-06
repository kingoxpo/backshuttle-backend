import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { ILike } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { DeleteStoreOutput } from './dtos/delete-store.dto';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';
import { Category } from './entities/category.entity';
import { StoresInput, StoresOutput } from './dtos/stores.dto';
import { StoreInput, StoreOutput } from './dtos/store.dto';
import { SearchStoreInput, SearchStoreOutput } from './dtos/search-store.dto';
import { StoreRepository } from './repositories/store.repository';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { EditProductInput, EditProductOutput } from './dtos/edit-product.dto';
import { DeleteProductOutput } from './dtos/delete-product.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly products: ProductRepository,
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
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '스토어를 만들 수 없습니다',
      };
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
        };
      }
      let category: Category = null;
      if (editStoreInput.categoryName) {
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
      };
    } catch {
      return {
        ok: false,
        error: '스토어를 수정할 수 없습니다.',
      };
    }
  }

  async deleteStore(owner: User, { storeId }): Promise<DeleteStoreOutput> {
    try {
      const checkStore = await this.stores.checkStore(owner.id, storeId);
      if (!checkStore.ok) {
        return {
          ...checkStore,
        };
      }
      await this.stores.delete(storeId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '스토어를 삭제할 수 없습니다.',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.',
      };
    }
  }

  countStores(category: Category): Promise<number> {
    return this.stores.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다.',
        };
      }
      const { stores } = await this.stores.findPagination(page, {
        category,
      });

      category.stores = stores;

      const totalResults = await this.countStores(category);

      return {
        ok: true,
        stores,
        category,
        totalPages: Math.ceil(totalResults / 10),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.',
      };
    }
  }

  async allStores({ page }: StoresInput): Promise<StoresOutput> {
    try {
      return await this.stores.findAndCountPagination(page);
    } catch {
      return {
        ok: false,
        error: '스토어를 불러올 수 없습니다.',
      };
    }
  }

  async findStoreById({ storeId }: StoreInput): Promise<StoreOutput> {
    try {
      const store = await this.stores.findOne(storeId, {
        relations: ['products'],
      });
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.',
        };
      }
      return {
        ok: true,
        store,
      };
    } catch {
      return {
        ok: false,
        error: '스토어를 불러올 수 없습니다.',
      };
    }
  }

  async searchStoreByName({
    query,
    page,
  }: SearchStoreInput): Promise<SearchStoreOutput> {
    try {
      return await this.stores.findAndCountPagination(page, {
        name: ILike(`%${query}%`),
      });
    } catch {
      return {
        ok: false,
        error: '스토어를 검색할 수 없습니다.',
      };
    }
  }

  async createProduct(
    owner: User,
    createProductInput: CreateProductInput,
  ): Promise<CreateProductOutput> {
    try {
      const store = await this.stores.findOne(createProductInput.storeId);
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.',
        };
      }
      if (owner.id !== store.ownerId) {
        return {
          ok: false,
          error: '권한이 없습니다.',
        };
      }
      await this.products.save(
        this.products.create({ ...createProductInput, store }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '상품을 생성할 수 없습니다.',
      };
    }
  }

  async editProduct(
    owner: User,
    editProductInput: EditProductInput,
  ): Promise<EditProductOutput> {
    try {
      const checkProduct = await this.products.checkProduct(
        owner.id,
        editProductInput.productId,
      );
      if (!checkProduct.ok) {
        return {
          ...checkProduct,
        };
      }

      await this.products.save([
        {
          id: editProductInput.productId,
          ...editProductInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '상품을 수정할 수 없습니다.',
      };
    }
  }

  async deleteProduct(
    owner: User,
    { productId },
  ): Promise<DeleteProductOutput> {
    try {
      const checkProduct = await this.products.checkProduct(
        owner.id,
        productId,
      );
      if (!checkProduct.ok) {
        return {
          ...checkProduct,
        };
      }
      await this.products.delete(productId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '상품을 삭제할 수 없습니다.',
      };
    }
  }
}
