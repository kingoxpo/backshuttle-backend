import { Args, Mutation, PartialType, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { Store } from "./entities/store.entity";
import { StoreService } from "./store.service";

@Resolver(of => Store)
export class StoreResolver{
  constructor(private readonly storeService: StoreService) {}

  @Mutation(returns => CreateStoreOutput)
  async createStore(
    @AuthUser() authUser: User,
    @Args('input') createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    return this.storeService.createStore(
      authUser,
      createStoreInput,
    );  
  }
}
