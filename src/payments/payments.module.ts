import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Store])],
  providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}
