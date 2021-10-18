import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@ObjectType()
@Entity()
export class Store {

    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @Field(type => String)
    @Column()
    name: string;

    @Field(type => Boolean)
    @Column()
    isCosmetic: boolean;

    @Field(type => Boolean)
    @Column()
    address: string;

    @Field(type => Boolean)
    @Column()
    ownerName: string;

    @Field(type => String)
    @Column()
    categoryName: string;
}