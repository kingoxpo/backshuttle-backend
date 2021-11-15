import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "src/mail/mail.service";


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    ) {}
    
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists){
        // make error
        return {ok: false, error:'이미 가입된 이메일 주소입니다. 다른 이메일을 입력하여 주세요.'};
      }
      const user = await this.users.save(
        this.users.create({email, password, role}),
      );
      const verification = await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return {ok: true};
    } catch(e) {
      //make error
      return {ok: false, error:'계정을 생성할 수 없습니다.'};
    }

  }

  async login({
    email,
    password,
   }: LoginInput): Promise<LoginOutput> {
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
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,          
      }      
    } catch(error){
      return {
        ok: false,
        error: '로그인할 수 없음',
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user: user,
      };

    } catch (error) {
      return {
        ok: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }
  }

  

  async editProfile(
    userId:number,{
      email,
      password,
    }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if(email) {
        user.email = email;
        user.verified = false;
        this.verification.delete({
          user: {
            id: user.id
          }
        });
        const verification = await this.verification.save(
          this.verification.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: '프로필을 업데이트 할 수 없습니다.'};
    }      
  } 

  async verifyEmail(code: string): Promise<VerifyEmailOutput>{
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user']},
      );
      if(verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: '인증정보를 찾을 수 없습니다.' };
    } catch (error) {
      return { ok:false, error: '인증에 실패하였습니다.' };
    }
  }
}
