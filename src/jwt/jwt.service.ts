import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  welcome(){
    console.log('welcome');
  }
}
