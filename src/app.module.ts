import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".dev.env" : ".test.env",
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'kingoxpo',
      password: 'tnsqhr8516',
      database: 'backshuttle',
      synchronize: true,
      logging: true
    }),
    GraphQLModule.forRoot({
    autoSchemaFile: true,
    }),
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
