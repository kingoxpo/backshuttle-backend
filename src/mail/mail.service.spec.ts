import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"

jest.mock('got', () => {});
jest.mock('form-data', () => {

})

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MailService, {
        provide: CONFIG_OPTIONS,
        useValue: {
          apikey: 'test_apikey',
          domain: 'test_domain',
          fromEamil: 'test_fromEmail',
        },
      }],
    }).compile();
    service = module.get<MailService>(MailService);
  });
  
  it('it should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('sendEmail', () => {});
  describe('sendVerificationEmail', () => {
  
  })


})