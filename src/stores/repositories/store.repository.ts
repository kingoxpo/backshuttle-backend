import { EntityRepository, Repository } from 'typeorm';
import { RepositoryStoreOutput } from '../dtos/repository-store.dto';
import { Store } from '../entities/store.entity';

@EntityRepository(Store)
export class StoreRepository extends Repository<Store> {
  take() {
    return 25;
  }

  skip(page: number) {
    return (page - 1) * this.take();
  }

  totalPages(totalResult: number) {
    return Math.ceil(totalResult / this.take());
  }

  async checkStore(
    ownerId: number,
    storeId: number,
  ): Promise<RepositoryStoreOutput> {
    const store = await this.findOneOrFail(storeId);
    if (!store) {
      return {
        ok: false,
        error: '스토어를 찾을 수 없습니다.',
      };
    }
    if (ownerId !== store.ownerId) {
      return {
        ok: false,
        error: '내 스토어만 변경할 수 있습니다.',
      };
    }
    return {
      ok: true,
    };
  }

  async findPagination(
    page: number,
    where: object = null,
  ): Promise<RepositoryStoreOutput> {
    const stores = await this.find({
      where: {
        ...where,
      },
      order: {
        isPromoted: 'DESC',
      },
      take: this.take(),
      skip: this.skip(page),
    });
    return {
      ok: true,
      stores,
    };
  }

  async findAndCountPagination(
    page: number,
    where: object = null,
  ): Promise<RepositoryStoreOutput> {
    const [stores, totalResults] = await this.findAndCount({
      where: {
        ...where,
      },
      order: {
        isPromoted: 'DESC',
      },
      skip: (page - 1) * this.take(),
      take: this.take(),
      relations: ['category'],
    });

    return {
      ok: true,
      results: stores,
      stores,
      totalPages: this.totalPages(totalResults),
      totalResults,
    };
  }
}
