import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Store } from "./store.entity";


@InputType('ProductInputType',{ isAbstract: true })
@ObjectType()
@Entity()
export class Product extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  @Length(2)
  name: string;

  @Field(type => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String)
  @Column()
  @IsString()
  img: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  description: string;

  @Field(type => Store)
  @ManyToOne(
    type => Store,
    store => store.products,
    { onDelete: 'CASCADE' }
  )
  store: Store;

  @RelationId((product: Product) => product.store)
  storeId: number;


}