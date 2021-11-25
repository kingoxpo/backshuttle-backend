import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { CategoryRepository } from 'src/store/repositories/category.repository';
import { CategoryResolver } from './categories.resolver';
import { CategoryService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, CategoryRepository])],
    providers: [CategoryResolver,CategoryService],
})
export class CategoriesModule {}
