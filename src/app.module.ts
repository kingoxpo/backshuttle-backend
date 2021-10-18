import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    StoreModule,
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
  StoreModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
