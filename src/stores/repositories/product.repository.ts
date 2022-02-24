import { CoreOutput } from 'src/common/dtos/output.dto';
import { EntityRepository, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  async checkProduct(ownerId: number, productId: number): Promise<CoreOutput> {
    const product = await this.findOne(productId, {
      relations: ['store'],
    });
    if (!product) {
      return {
        ok: false,
        error: '상품을 찾을 수 없습니다.',
      };
    }
    if (product.store.ownerId !== ownerId) {
      return {
        ok: false,
        error: '권한이 없습니다.',
      };
    }
    return {
      ok: true,
    };
  }
}
