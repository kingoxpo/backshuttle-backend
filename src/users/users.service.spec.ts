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
  sign:jest.fn(),
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

  beforeAll(async () => {
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
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });


  it('it should be defind', () => {
    expect(service).toBeDefined();
  })

  describe('createAccount', () => {

    const createAccountArgs = {
      email: '',
      password: '',
      role: 1,
    }

    it("should fail if user exists", async () => {
      usersRepository.findOne.mockResolvedValue({
        id:1,
        email:"test@test.com",
      })
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false, error:'이미 가입된 이메일 주소입니다. 다른 이메일을 입력하여 주세요.',
      });
    });
    it('sould create a new user', async () => {
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
    })
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');

})
