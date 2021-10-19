import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class Store {

    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => Boolean)
    @Column()
    @IsBoolean()
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