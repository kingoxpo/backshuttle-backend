import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    ) {}
    async createAccount({
      email,
      password,
      role,
    }: CreateAccountInput): Promise<string | undefined> {
      try {
        const exists = await this.users.findOne({ email });
        if (exists){
          // make error
          return '이미 가입된 이메일 주소입니다. 다른 이메일을 입력하여 주세요.';
        }
        await this.users.save(this.users.create({email, password, role}));
      } catch(e) {
        //make error
        return '계정을 생성할 수 없습니다';
      }
      // check new user
      // create user & hash the password

    }
}