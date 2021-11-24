import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CreateStoreInput } from "./create-store.dto";


@InputType()
export class DeleteStoreInput {
  @Field(type => Number)
  storeId: number;
}

@ObjectType()
export class DeleteStoreOutput extends CoreOutput {}