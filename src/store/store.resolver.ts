import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { createStoreDto } from "./dtos/create-store.dto";
import { Store } from "./entities/store.entity";

@Resolver(of => Store)
export class StoreResolver{
    @Query(returns => [Store])
    store(@Args('cosmeticsOnly') cosmeticsOnly: Boolean): Store[]{
        return [];
    }
    @Mutation(returns => Boolean)
    createStore(
        @Args() createStoreDto: createStoreDto
    ): boolean {
        console.log(createStoreDto)
        return true;
    }
}
