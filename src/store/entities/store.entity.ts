import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Category } from "./category.entity";


@InputType('StoreInputType',{ isAbstract:true })
@ObjectType()
@Entity()
export class Store extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(2)
    name: string;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    coverImg: string;

    @Field(type => String)
    @Column()
    address: string;
    
    @Field(type => Category, { nullable: true })
    @ManyToOne(
      type => Category,
      category => category.stores,
      { nullable: true, onDelete: 'SET NULL' }
    )
    category: Category;

    @Field(type => User)
    @ManyToOne(
      type => User,
      user => user.stores,
      {onDelete: 'CASCADE'}
    )
    owner: User;

    @RelationId((store: Store) => store.owner)
    ownerId: number;

}