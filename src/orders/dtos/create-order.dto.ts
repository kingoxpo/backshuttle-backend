import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";


@InputType()
export class CreateOrderInput extends PickType(Order, ['products']) {
  @Field(type => Int)
  storeId: number;


}
@ObjectType()
export class CreateOrderOutput extends CoreOutput {}