import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";


@InputType({ isAbstract:true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(3)
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => [Store])
    @OneToMany(type => Store, store => store.category)
    stores: Store[];    


}