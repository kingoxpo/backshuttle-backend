import { InputType, OmitType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";



@InputType()
export class CreateUserDto extends OmitType(User, ['id']) {}