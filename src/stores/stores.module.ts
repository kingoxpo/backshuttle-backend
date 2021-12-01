import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryResolver, ProductResolver, StoreResolver } from './stores.resolver';
import { StoreRepository } from './repositories/store.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { StoreService } from './stores.service';
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
