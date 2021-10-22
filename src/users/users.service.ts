import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
    ) {
      console.log(this.config.get('SECRET_KEY'))
    }
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
    }

    async login({
      email, 
      password,
    }: LoginInput): Promise<{ ok:boolean; error?:string, token?: string }> {
      // check if the password is correct
      // make a JWT and give it to the user
      try {
        const user = await this.users.findOne({ email });
        if(!user){
          return {
            ok: false,
            error: '이메일을 다시 확인하세요. 등록되지 않은 이메일입니다.'
          };
        }
        const passwordCorrect = await user.checkPassword(password);
        if(!passwordCorrect){
          return{
            ok:false,
            error: '잘못된 비밀번호입니다. 다시 시도하거나 비밀번호 찾기를 클릭하여 재설정하세요.'
          };
        }
        const token = jwt.sign({id:user.id}, this.config.get('SECRET_KEY'))
        return {
          ok: true,
          token:'create login token',
        }
      } catch(error){
        return {
          ok: false,
          error,
        };
      }
    }
}