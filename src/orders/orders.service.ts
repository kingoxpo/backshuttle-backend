import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "src/stores/entities/store.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Store)
    private readonly stores: Repository<Store>
  ) {}

  async createOrder(
    customer: User,
    {storeId, items}: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const store = await this.stores.findOne(storeId)
    if(!store) {
      return {
        ok: false,
        error: '스토어를 찾을 수 없습니다.'
      };
    }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          store,
        }),
      );
      console.log(order)
      return {
        ok: true,
      };    
    } catch {
      return {
        ok: false,
        error: '주문을 생성할 수 없습니다.'
      }
    }
  }
}
