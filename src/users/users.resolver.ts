import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateUserDto } from "./dtos/create-user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";



@Resolver(of => User)
export class UsersResolver{
    constructor(private readonly userService: UsersService) {}
    @Query(returns => [Boolean])
    user() {
        return true;
    }
}
//     @Mutation(returns => Boolean)
//     async createUser(
//         @Args('input') createUserDto: CreateUserDto,
//         ): Promise<boolean> {
//             console.log(createUserDto);
//         try {
//             await this.userService.createUser(createUserDto);
//             return true;            
//         }   catch(e) {
//             console.log(e);
//             return false;
//         }
//     }
// }