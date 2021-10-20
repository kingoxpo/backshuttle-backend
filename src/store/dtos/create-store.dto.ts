import { InputType, OmitType } from "@nestjs/graphql";
import { Store } from "../entities/store.entity";



@InputType()
export class CreateStoreDto extends OmitType(Store, ['id']) {}