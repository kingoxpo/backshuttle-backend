import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  }
})

const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  EMAIL: 'back@shuttle.com',
  PASSWORD : '12345',
}

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>
  let jwtToken: String;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close();
  })

  describe('createAccount', () => {

    it('계정생성 처리', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          createAccount(input:{
            email:"${testUser.EMAIL}"
            password: "${testUser.PASSWORD}"
            role: Client
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
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          createAccount(input:{
            email:"${testUser.EMAIL}"
            password: "${testUser.PASSWORD}"
            role: Client
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
      })
    });
  });

  describe('login', () => {
    it('인증성공 시 로그인성공', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          login(input:{
            email:"${testUser.EMAIL}"
            password: "${testUser.PASSWORD}"            
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
        expect(login.token).toEqual(expect.any(String))
        jwtToken = login.token;
      })
    });
  
    it('인증실패 시 로그인실패', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          login(input:{
            email:"${testUser.EMAIL}"
            password: "xxx"            
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
      })
    })
  })
  describe('userProfile', () => {

  });
  describe('me', () => {

  });
  describe('verifyEmail', () => {

  });
  describe('editProfile', () => {
    
  });
});
