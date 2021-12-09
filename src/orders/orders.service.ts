import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/stores/entities/product.entity";
import { Store } from "src/stores/entities/store.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,

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
    for (const item of items) {
      const product = await this.products.findOne(item.productId)
      if(!product){
        return {
          ok: false,
          error: '상품을 찾을 수 없습니다.'       
        }
        // 상품을 못찾으면 작업 전부 취소
      }
      console.log(`주문가격: ₩${product.price}원`)
      for(const itemOption of item.options) {        
        const productOption = product.options.find(
          productOption => productOption.name === itemOption.name,
        );
        if(productOption) {
          if(productOption.extra) {
            console.log(`₩${productOption.extra}원`)
          } else {
            const productOptionSelect = productOption.selects.find(
              productSelect => productSelect.name === itemOption.select,
            );
            if (productOptionSelect) {
              if (productOptionSelect.extra) {
                console.log(`₩${productOptionSelect.extra}원`)
              }
            }            
          }          
        }
      }
      //   await this.orderItems.save(this.orderItems.create({
      //     product,
      //     options: item.options,
      //   }),
      // );
    };
    // const order = await this.orders.save(
      //   this.orders.create({
      //     customer,
      //     store,
      //   }),
      // );
      // console.log(order)
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
