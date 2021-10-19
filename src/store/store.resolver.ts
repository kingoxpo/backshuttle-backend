import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateStoreDto } from "./dtos/create-store.dto";
import { Store } from "./entities/store.entity";
import { StoreService } from "./store.service";

@Resolver(of => Store)
export class StoreResolver{
    constructor(private readonly storeService: StoreService) {}
    @Query(returns => [Store])
    store(): Promise<Store[]>{
        return this.storeService.getAll();
    }
    @Mutation(returns => Boolean)
    async createStore(
        @Args('input') createStoreDto: CreateStoreDto,
        ): Promise<boolean> {
        try {
            await this.storeService.createStore(createStoreDto);
            return true;
        }   catch (e) {
            console.log(e);
            return false;
        }        
    }
}
