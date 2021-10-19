import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Store } from "../entities/store.entity";



@InputType()
export class CreateStoreDto extends OmitType(Store, ['id']) {}