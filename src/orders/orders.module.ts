import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/stores/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './order.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Store, OrderItem, Product])],
  providers: [OrderResolver, OrderService],
})
export class OrdersModule {}
