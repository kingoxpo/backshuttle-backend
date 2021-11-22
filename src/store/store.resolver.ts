import { SetMetadata } from "@nestjs/common";
import { Args, Mutation, PartialType, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { CreateStoreInput, CreateStoreOutput } from "./dtos/create-store.dto";
import { Store } from "./entities/store.entity";
import { StoreService } from "./store.service";

@Resolver(of => Store)
export class StoreResolver{
  constructor(private readonly storeService: StoreService) {}
  @Role(['Owner'])
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
