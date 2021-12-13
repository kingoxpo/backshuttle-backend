import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/stores/entities/product.entity";
import { Store } from "src/stores/entities/store.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
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
    let orderFinalPrice = 0;
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = await this.products.findOne(item.productId)
      if(!product){
        return {
          ok: false,
          error: '상품을 찾을 수 없습니다.'       
        };
      }
      let productFinalPrice = product.price;
      for (const itemOption of item.options) {        
        const productOption = product.options.find(
          productOption => productOption.name === itemOption.name,
        );
        if(productOption) {
          if(productOption.extra) {
            productFinalPrice = productFinalPrice + productOption.extra
          } else {
            const productOptionSelect = productOption.selects.find(
              productSelect => productSelect.name === itemOption.select,
            );
            if (productOptionSelect) {
              if (productOptionSelect.extra) {
                productFinalPrice = productFinalPrice + productOptionSelect.extra;
              }
            }            
          }          
        }
      }
      orderFinalPrice = orderFinalPrice + productFinalPrice;
      const orderItem = await this.orderItems.save(
        this.orderItems.create({
          product,
          options: item.options,
        }),
      );
      orderItems.push(orderItem);
    }
    await this.orders.save(
        this.orders.create({
          customer,
          store,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
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


  async getOrders(
    user:User, {status}: GetOrdersInput,
    ): Promise<GetOrdersOutput> {
      try {
        
      let orders: Order[]
      if(user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
          },
        });
      } else if(user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
          },
        });
      } else if(user.role === UserRole.Owner) {
        const stores = await this.stores.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = stores.map(store => store.orders).flat(1);
      }
      return {
        ok: true,
        orders
      };
    } catch {
      return {
        ok: false,
        error: '주문을 불러올 수 없습니다.'
      }
    }
  }
}
