import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_ORDER_UPDATE,
  NEW_PACKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Product } from 'src/stores/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

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
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { storeId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const store = await this.stores.findOne(storeId);
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const product = await this.products.findOne(item.productId);
        if (!product) {
          return {
            ok: false,
            error: '상품을 찾을 수 없습니다.',
          };
        }
        let productFinalPrice = product.price;
        for (const itemOption of item.options) {
          const productOption = product.options.find(
            (productOption) => productOption.name === itemOption.name,
          );
          if (productOption) {
            if (productOption.extra) {
              productFinalPrice = productFinalPrice + productOption.extra;
            } else {
              const productOptionSelect = productOption.selects.find(
                (productSelect) => productSelect.name === itemOption.select,
              );
              if (productOptionSelect) {
                if (productOptionSelect.extra) {
                  productFinalPrice =
                    productFinalPrice + productOptionSelect.extra;
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
      const order = await this.orders.save(
        this.orders.create({
          customer,
          store,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: store.ownerId },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 생성할 수 없습니다.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const stores = await this.stores.find({
          where: {
            owner: user,
            ...(status && { status }),
          },
          relations: ['orders'],
        });
        orders = stores.map((store) => store.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 불러올 수 없습니다.',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let allowed = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      allowed = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      allowed = false;
    }
    if (user.role === UserRole.Owner && order.store.ownerId !== user.id) {
      allowed = false;
    }
    return allowed;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['store'],
      });
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 볼 수 없습니다.',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 불러올 수 없습니다.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['store', 'customer', 'driver'],
      });
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 볼 수 없습니다.',
        };
      }
      let canEdit = true;
      if (user.role === UserRole.Client) {
        if (status !== OrderStatus.Pending && status !== OrderStatus.Cancel) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Owner) {
        if (
          status !== OrderStatus.Confirm &&
          status !== OrderStatus.Packed &&
          status !== OrderStatus.PickedUp
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: '권한이 없습니다.',
        };
      }
      await this.orders.save({
        id: orderId,
        status,
      });
      const newOrder = { ...order, status };
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Packed) {
          await this.pubSub.publish(NEW_PACKED_ORDER, {
            packedOrders: newOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 수정할 수 없습니다.',
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }
      if (order.driver) {
        return {
          ok: false,
          error: '이미 기사가 배정되어있습니다.',
        };
      }
      await this.orders.save([
        {
          id: orderId,
          driver,
        },
      ]);
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 수정할 수 없습니다.',
      };
    }
  }
}
