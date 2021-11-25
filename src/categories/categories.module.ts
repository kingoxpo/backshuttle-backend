import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { CategoryRepository } from 'src/store/repositories/category.repository';
import { StoreService } from 'src/store/store.service';
import { CategoryResolver } from './categories.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Store, CategoryRepository])],
    providers: [StoreService,CategoryResolver],
})
export class CategoriesModule {}
