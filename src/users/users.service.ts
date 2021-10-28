import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
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
        const user = await this.users.save(this.users.create({email, password, role}));
        await this.verification.save(this.verification.create({ user }));
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
        const user = await this.users.findOne(
          { email },
          { select: ['id','password']}
        );
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
        // console.log(user)
        const token = this.jwtService.sign(user.id);
        return {
          ok: true,
          token,          
        }      
      } catch(error){
        return {
          ok: false,
          error,
        };
      }
    }

    async findById(id:number): Promise<User> {
      return this.users.findOne({id});
    }

    async editProfile(userId:number, {email, password}: EditProfileInput,
      ): Promise<User> {    
      const user = await this.users.findOne(userId);
      if(email){
        user.email = email;
        user.verified = false;
        await this.verification.save(this.verification.create({ user }));
      }
      if(password) {
        user.password = password;
      }
      return this.users.save(user);
    }

    async verifyEmail(code: string): Promise<boolean>{
      try {
        const verification = await this.verification.findOne(
          { code },
          { relations: ["user"]},
        );
        if(verification) {
          verification.user.verified = true;
          console.log(verification.user);
          this.users.save(verification.user);
          return true;
        }
        throw new Error();
      } catch (e) {
        console.log(e)
        return false;
      }
    }
}