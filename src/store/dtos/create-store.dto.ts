import { ArgsType, Field } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";



@ArgsType()
export class createStoreDto {
    @Field(type => String)
    @IsString()
    @Length(5, 10)
    name:string;

    @Field(type => Boolean)
    @IsBoolean()
    isCosmetic:boolean;

    @Field(type => String)
    @IsString()
    address:string;

    @Field(type => String)
    @IsString()
    ownerName:string;
}