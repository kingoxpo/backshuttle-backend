import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Store } from "./store.entity";


@InputType('ProductSelectInputType', { isAbstract: true })
@ObjectType()
export class ProductSelect {

  @Field(type => String)
  name: string;  

  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('ProductOptionInputType', { isAbstract: true })
@ObjectType()
export class ProductOption {

  @Field(type => String)
  name: string;

  @Field(type => [ProductSelect], { nullable: true })
  selects?: ProductSelect[];

  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('ProductInputType', { isAbstract: true })
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

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  img: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(1)
  description: string;

  @Field(type => Store)
  @ManyToOne(
    type => Store,
    store => store.products,
    { onDelete: 'CASCADE', nullable: false }
  )
  store: Store;

  @RelationId((product: Product) => product.store)
  storeId: number;

  @Field(type => [ProductOption], { nullable: true })
  @Column({type: 'json', nullable: true })
  options?: ProductOption[]
}