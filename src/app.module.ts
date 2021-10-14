import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { StoreModule } from './store/store.module';

@Module({
  imports: [GraphQLModule.forRoot({
    autoSchemaFile: true,
  }),
  StoreModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
