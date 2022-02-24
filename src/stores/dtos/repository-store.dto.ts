import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Store } from '../entities/store.entity';

@ObjectType()
export class RepositoryStoreOutput extends CoreOutput {
  @Field((type) => Store, { nullable: true })
  store?: Store;

  @Field((type) => [Store], { nullable: true })
  stores?: Store[];

  @Field((type) => Int, { nullable: true })
  totalResults?: number;

  @Field((type) => Int, { nullable: true })
  totalPages?: number;

  @Field((type) => [Store], { nullable: true })
  results?: Store[];
}
