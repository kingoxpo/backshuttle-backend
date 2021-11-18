import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Store } from './entities/store.entity';
import { StoreResolver } from './store.resolver';
import { StoreService } from './store.service';

@Module({
    imports: [TypeOrmModule.forFeature([Store, Category])],
    providers: [StoreResolver, StoreService],
})
export class StoreModule {}
