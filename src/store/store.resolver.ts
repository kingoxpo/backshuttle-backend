import { Args, Query, Resolver } from "@nestjs/graphql";
import { Store } from "./entities/store.entity";

@Resolver(of => Store)
export class StoreResolver{
    @Query(returns => [Store])
    store(@Args('cosmeticsOnly') cosmeticsOnly: Boolean): Store[]{
        return [];
    } 
}