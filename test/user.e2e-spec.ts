import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql'

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close();
  })

  describe('createAccount', () => {
    const EMAIL = 'back@shuttle.com'
    it('계정생성', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation {
          createAccount(input:{
            email:"${EMAIL}"
            password: "12345"
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
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })
  });

  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');

});
