import { Field, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class Store {
    @Field(type => String)
    name: string;

    @Field(type => Boolean)
    isCosmetic: boolean;

    @Field(type => Boolean)
    address: boolean;

    @Field(type => Boolean)
    ownerName: boolean;
}