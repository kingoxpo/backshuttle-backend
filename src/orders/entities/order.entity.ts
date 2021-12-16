import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Product } from "src/stores/entities/product.entity";
import { Store } from "src/stores/entities/store.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
  Pending = 'Pending',
  Confirm = 'Confirm',
  Packed = 'Packed',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  Refund = 'Refund',
  Cancel = 'Cancel',
}


registerEnumType(OrderStatus, { name: 'OrderStatus' })


@InputType('OrderInputType',{ isAbstract:true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.orders,
    { nullable: true, onDelete: 'SET NULL' }
  )
  customer?: User

  @RelationId((order: Order) => order.customer)
  customerId: number
  
  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { nullable: true, onDelete: 'SET NULL' }
  )
  driver?: User

  @RelationId((order: Order) => order.driver)
  driverId: number

  @Field(type => Store)
  @ManyToOne(
    type => Store,
    store => store.orders,
    { nullable: true, onDelete: 'SET NULL' }
  )
  store: Store

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
  @JoinTable()
  items: OrderItem[]

  @Column({ nullable: true })
  @Field(type => Float, { nullable: true })
  @IsNumber()
  total?: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending})
  @Field(type => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus
}