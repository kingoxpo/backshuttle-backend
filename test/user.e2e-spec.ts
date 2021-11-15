import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  email: 'back@shuttle.com',
  password: '12345',
}

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });
  
  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close();
  })
  describe('createAccount', () => {
    it('계정생성 처리', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          createAccount(input: {
            email:"${testUser.email}"
            password: "${testUser.password}"
            role: Owner
          }) {
            ok
            error
          }
        }
        `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { createAccount }
          },
        } = res;
        expect(createAccount.ok).toBe(true)
        expect(createAccount.error).toBe(null)
      });
    });
    it('사용중인 아이디가 이미 있으면 실패처리', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          createAccount(input:{
            email:"${testUser.email}"
            password: "${testUser.password}"
            role: Owner
          }) {
            ok
            error
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { createAccount }
          },          
        } = res;
        expect(createAccount.ok).toBe(false)
        expect(createAccount.error).toEqual(expect.any(String))
      });
    });
  });
  describe('login', () => {
    it('인증성공 시 로그인성공', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          login(input:{
            email:"${testUser.email}"
            password: "${testUser.password}"            
          }) {
            ok
            error
            token
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { login },            
          },
        } = res;
        expect(login.ok).toBe(true)
        expect(login.error).toBe(null)
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      });
    }); 
    it('인증실패 시 로그인실패', () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          login(input:{
            email:"${testUser.email}",
            password: "xxx",
          }) {
            ok
            error
            token
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { login },            
          },
        } = res;
        expect(login.ok).toBe(false)
        expect(login.error).toBe('잘못된 비밀번호입니다. 다시 시도하거나 비밀번호 찾기를 클릭하여 재설정하세요.')
        expect(login.token).toBe(null)
      });
    });
  });
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await userRepository.find()
      userId = user.id
    });
    it('사용자 프로필을 봐야함', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query:`
        {
          userProfile(userId:${userId}){
            error
            ok
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: {
                ok,
                error,
                user: { id }
              } 
            },            
          },
        } = res;
        expect(ok).toBe(true)
        expect(error).toBe(null)
        expect(id).toBe(userId)
      });
  });
    it('프로필을 찾지못함', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query:`
        {
          userProfile(userId:2){
            error
            ok
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: {
                ok,
                error,
                user,
              }
            },            
          },
        } = res;
        expect(ok).toBe(false)
        expect(error).toBe("사용자를 찾을 수 없습니다.")
        expect(user).toBe(null)
      });
    });
  });
  describe('me', () => {
    it('내 프로필을 찾음', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query:`
        {
          me {
            email
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              me: { email },
            },
          },
        } = res;
        expect(email).toBe(testUser.email);
      });
    });
    it('로그아웃 된 사용자는 허용하지 않음', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query:`
        {
          me {
            email
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            errors: [{ message }]
          },
        } = res;        
        expect(message).toBe('Forbidden resource');
      });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'test@mail.com'
    it('이메일을 변경 함', () => {      
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query:`
        mutation{
          editProfile(input:{
            email:"${NEW_EMAIL}"
          }) {
            ok
            error
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              editProfile: { ok, error },
            },
          },
        } = res;
        expect(ok).toBe(true)
        expect(error).toBe(null)
      });
    });
    it('새로운 이메일을 가짐', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query: `
        {
          me {
            email
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              me: {email}
            },
          },
        } = res;
        expect(email).toBe(NEW_EMAIL)
      });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });
    it('이메일 인증 함', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query:`
        mutation{
          verifyEmail(input:{
            code:"${verificationCode}"
          })  {
            error
            ok
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: {
              verifyEmail: {ok, error},
            }
          }
        } = res;
        expect(ok).toBe(true)
        expect(error).toBe(null)
      })
    })
    it('인증코드를 찾을 수 없으면 실패처리', () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query:`
        mutation{
          verifyEmail(input:{
            code:"xxx"
          })  {
            error
            ok
          }
        }
      `,
      })
      .expect(200)
      .expect(res => {
        const { 
          body: {
            data: {
              verifyEmail: {ok, error},
            }
          }
        } = res;
        expect(ok).toBe(false)
        expect(error).toBe('인증정보를 찾을 수 없습니다.')
      })
    })
  });

});
