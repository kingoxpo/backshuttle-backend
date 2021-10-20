import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateStoreDto } from "./create-store.dto";



@InputType()
class UpdateStoreInputType extends PartialType(CreateStoreDto) {}

@InputType()
export class UpdateStoreDto {
    @Field(type => Number)
    id: number;

    @Field(type => UpdateStoreInputType)
    data: UpdateStoreInputType;
}