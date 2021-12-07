import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { ProductOption } from "src/stores/entities/product.entity";
import { Order } from "../entities/order.entity";


@InputType()
export class CreateOrderItemInput {
  @Field(type => Int)
  productId: number;
  
  @Field(type => ProductOption, { nullable: true })
  options?: ProductOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(type => Int)
  storeId: number;

  @Field(type => [CreateOrderItemInput])
  items?: CreateOrderItemInput[];
}
@ObjectType()
export class CreateOrderOutput extends CoreOutput {}