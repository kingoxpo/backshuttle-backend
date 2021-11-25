import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { CategoryRepository } from 'src/store/repositories/category.repository';
import { CategoryResolver } from './categories.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Store, CategoryRepository])],
    providers: [CategoryResolver],
})
export class CategoriesModule {}
