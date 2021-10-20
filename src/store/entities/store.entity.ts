import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { string } from "joi";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@InputType({ isAbstract:true })
@ObjectType()
@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @Field(type => String)
    @Column()
    @IsString()
    @Length(3)
    name: string;

    @Field(type => Boolean, { nullable: true } )
    @Column({ default:true })
    @IsOptional()
    @IsBoolean()
    isCosmetic: boolean;

    @Field(type => String, { defaultValue: "서울" } )
    @Column()
    address: string;

    @Field(type => String)
    @Column()
    @IsString()
    ownerName: string;

    @Field(type => String)
    @Column()
    @IsString()
    categoryName: string;
}