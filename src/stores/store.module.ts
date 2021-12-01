import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryResolver, ProductResolver, StoreResolver } from './store.resolver';
import { StoreService } from './store.service';
import { StoreRepository } from './repositories/store.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
@Module({
    imports: [TypeOrmModule.forFeature([
        StoreRepository,
        ProductRepository,
        CategoryRepository,
    ])],
    providers: [
        StoreResolver,
        CategoryResolver,
        ProductResolver,
        StoreService,
    ],
})
export class StoreModule {}
