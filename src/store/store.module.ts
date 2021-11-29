import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from 'src/store/repositories/category.repository';
import { CategoryResolver, StoreResolver } from './store.resolver';
import { StoreService } from './store.service';
import { StoreRepository } from './repositories/store.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryRepository, StoreRepository])],
    providers: [StoreResolver, StoreService, CategoryResolver],
})
export class StoreModule {}
