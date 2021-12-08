import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Product, ProductOption, ProductSelect } from "src/stores/entities/product.entity";
import { Column, Entity, ManyToOne } from "typeorm";


@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(type => String)
  name: string;

  @Field(type => String, { nullable: true })
  select?: String;

  @Field(type => Int, { nullable: true })
  extra?: number;
}


@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(type => Product)
  @ManyToOne(
    type => Product,
    { nullable: true, onDelete: 'CASCADE'},
  )
  product?: Product;

  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[]
}

