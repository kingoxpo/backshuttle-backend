import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Product } from "src/stores/entities/product.entity";
import { Store } from "src/stores/entities/store.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

export enum OrderStatus {
  Pending = 'Pending',
  Confirm = 'Confirm',
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

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { nullable: true, onDelete: 'SET NULL' }
  )
  driver?: User

  @Field(type => Store)
  @ManyToOne(
    type => Store,
    store => store.orders,
    { nullable: true, onDelete: 'SET NULL' }
  )
  store: Store

  @Field(type => [Product])
  @ManyToMany(type => Product)
  @JoinTable()
  products: Product[]

  @Column({ nullable: true })
  @Field(type => Float, { nullable: true })
  total?: number

  @Column({ type: 'enum', enum: OrderStatus})
  @Field(type => OrderStatus)
  status: OrderStatus
}