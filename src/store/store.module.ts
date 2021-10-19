import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreResolver } from './store.resolver';
import { StoreService } from './store.service';

@Module({
    imports: [TypeOrmModule.forFeature([Store])],
    providers: [StoreResolver, StoreService],
})
export class StoreModule {}
