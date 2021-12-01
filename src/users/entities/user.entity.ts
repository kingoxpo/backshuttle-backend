import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Store } from 'src/stores/entities/store.entity';

export enum UserRole {
  Owner = 'Owner',
  Client = 'Client',
  Delivery = 'Delivery',
}
registerEnumType(UserRole, {name:"UserRole"})

@InputType('UserInputType',{ isAbstract:true })
@ObjectType()
@Entity()
export class User extends CoreEntity{
    @Column({ unique:true })
    @Field(type => String)
    @IsEmail()
    email: string;

    @Column({select: false})
    @Field(type => String)
    @IsString()
    password: string;

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({default: false})
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @Field(type => [Store])
    @OneToMany(
      type => Store,
      store => store.owner,
    )
    stores: Store[];    

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
      if (this.password) {
        try {
        this.password = await bcrypt.hash(this.password, 10);
        } catch(e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
      }
    }

    async checkPassword(plainPassword:string) : Promise<boolean> {
      try {
        const ok = await bcrypt.compare(plainPassword, this.password)
        return ok;
      } catch(e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
}