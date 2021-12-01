import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";


@InputType()
export class DeleteProductInput {
  @Field(type => Int)
  productId: number;
}

@ObjectType()
export class DeleteProductOutput extends CoreOutput {}