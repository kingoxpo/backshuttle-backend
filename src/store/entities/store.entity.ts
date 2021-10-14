import { Field, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class Store {
    @Field(type => String)
    name: string;
    @Field(type => Boolean, {nullable:true})
    isGood?: boolean;
}