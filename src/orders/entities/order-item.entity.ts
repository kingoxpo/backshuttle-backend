import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Product, ProductOption } from "src/stores/entities/product.entity";
import { Column, Entity, ManyToOne } from "typeorm";


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

  @Field(type => [ProductOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: ProductOption[]
}

