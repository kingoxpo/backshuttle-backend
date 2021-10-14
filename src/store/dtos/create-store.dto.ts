import { ArgsType, Field } from "@nestjs/graphql";



@ArgsType()
export class createStoreDto {
    @Field(type => String)
    name:string;
    @Field(type => Boolean)
    isCosmetic:boolean;
    @Field(type => String)
    address:string;
    @Field(type => String)
    ownerName:string;
}