import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service";

const mockRepository = () => ({
  findOne:jest.fn(),
  save:jest.fn(),
  create:jest.fn(),
});

const mockJwtService = {
  sign:jest.fn(() => 'signed-token'),
  verify:jest.fn(),
}
const mockMailService = {
  sendVerificationEmail:jest.fn(),
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, 
        {
          provide: getRepositoryToken(User),
          useValue:mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue:mockRepository(),
        },
        {
          provide: JwtService,
          useValue:mockJwtService,
        },
        {
          provide: MailService,
          useValue:mockMailService,
        },
        
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });


  it('it should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('createAccount', () => {

    const createAccountArgs = {
      email: '',
      password: '',
      role: 1,
    }

    it("이미 가입된 유저가 있을 경우 실패처리", async () => {
      usersRepository.findOne.mockResolvedValue({
        id:1,
        email:"test@test.com",
      })
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false, error:'이미 가입된 이메일 주소입니다. 다른 이메일을 입력하여 주세요.',
      });
    });
    it('새로운 사용자를 생성', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user:createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user:createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
        expect(result).toEqual({ok: true});
    });
    it('예외적인 실패처리', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs)
      expect(result).toEqual({ok: false, error: '계정을 생성할 수 없습니다.'})
    });
  });
  
  describe('login', () => {
    const loginArgs = {
      email: '',
      password: '',
    }
    it('사용자가 없을경우 실패처리', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);
      
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false, error: '이메일을 다시 확인하세요. 등록되지 않은 이메일입니다.',
      })
    });
    it('비밀번호가 틀릴경우 실패처리', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ok: false, error: '잘못된 비밀번호입니다. 다시 시도하거나 비밀번호 찾기를 클릭하여 재설정하세요.'})
    });

    it('패스워드가 일치할 경우 토큰을 리턴', async () => {
      const mockedUser = {
        id:1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      console.log(result)
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token'});
    });

    it('예외적인 실패처리', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs)
      expect(result).toEqual({ ok: false, error: '로그인할 수 없음'} )
    });
  });
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');

})
