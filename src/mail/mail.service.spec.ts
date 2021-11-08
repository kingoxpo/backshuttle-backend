import { Test } from "@nestjs/testing";
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test_domain'

describe('MailService', () => {
  let service: MailService;


  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MailService, {
        provide: CONFIG_OPTIONS,
        useValue: {
          apikey: 'test_apikey',
          domain: TEST_DOMAIN,
          fromEmail: 'test_fromEmail',
        },
      }],
    }).compile();
    service = module.get<MailService>(MailService);
  });
  
  it('it should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('sendVerificationEmail', () => {
    it('sendEmail 호출처리', () => {
      const sendVerificationEmailArgs ={
        email: 'email',
        code: 'code',
      }
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true)
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      )
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify',
        [
          {'key': 'code', 'value': sendVerificationEmailArgs.code},
          {'key': 'username', 'value': sendVerificationEmailArgs.email},
        ]
      )
    })
  })
  describe('sendEmail', () => {
    it('메일 보내기', async ()  => {
      const ok = await service.sendEmail('','', [{key:'one', value:'1'}]);
      const formSpy = jest.spyOn(FormData.prototype,'append')
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveReturnedTimes(1);
      expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
      expect.any(Object),
      );
      expect(ok).toEqual(true);
    });
    it('에러가 발생하면 실패', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      })
      const ok = await service.sendEmail('','', []);
      expect(ok).toEqual(false);
    })
  })

})