import got from "got";
import * as FormData from "form-data";
import { Inject, Injectable, Post } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
    ) {}

    async sendEmail(
      subject: string,
      template: string,
      emailVars: EmailVar[],
      ) {

      const form = new FormData();
      form.append("from", `Welcome Backshuttle <backshuttle@${this.options.domain}>`)
      form.append("to", 'kingoxpo@gmail.com');
      form.append("subject", subject);
      form.append("template", template);
      emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value))
      try {
        await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
          method: 'POST',
          headers: {
            "Authorization": `Basic ${Buffer.from(
              `api:${this.options.apikey}`,
            ).toString('base64')}`,
          },
          body: form,
        });
      } catch (error) {
        console.log(error);
      } 
    }

  sendVerificationEmail(email:string, code:string) {
    this.sendEmail('Verify Your Email', 'verify', [
      {'key': 'code', 'value': code},
      {'key': 'username', 'value': email},
    ])
  }
}
