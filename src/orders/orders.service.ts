import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>
  ) {}

  async createOrder(
    client: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const store = await this.orders.findOne(
        createOrderInput.storeId,
      )
      const newOrder = await this.orders.create(createOrderInput)      
      if(!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.'
        };
      }
      await this.orders.save(newOrder) 
      return {
        ok: true,
      }  
    } catch {
      return {
        ok: false,
        error: '주문을 생성할 수 없습니다.'
      }
    }
  }
}