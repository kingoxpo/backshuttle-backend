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
    }: CreateAccountInput): Promise<{ ok:boolean; error?:string }> {
      try {
        const exists = await this.users.findOne({ email });
        if (exists){
          // make error
          return {ok: false, error:'이미 가입된 이메일 주소입니다. 다른 이메일을 입력하여 주세요.'};
        }
        await this.users.save(this.users.create({email, password, role}));
        return {ok: true};
      } catch(e) {
        //make error
        return {ok: false, error:'계정을 생성할 수 없습니다'};
      }
      // hash the password

    }
}