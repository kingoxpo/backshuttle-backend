import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, storeId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const store = await this.stores.findOne(storeId);
      if (!store) {
        return {
          ok: false,
          error: '스토어를 찾을 수 없습니다.',
        };
      }
      if (store.ownerId !== owner.id) {
        return {
          ok: false,
          error: '권한이 없습니다.',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          store,
        }),
      );
      store.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      store.promotedUntil = date;
      this.stores.save(store);
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: '지불정보를 생성할 수 없습니다.' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: user });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: '지불정보를 불러올 수 없습니다.',
      };
    }
  }

  @Cron('0 24 * * *')
  async checkPromotedStores() {
    const stores = await this.stores.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });
    console.log(stores);
    stores.forEach(async (store) => {
      store.isPromoted = false;
      store.promotedUntil = null;
      await this.stores.save(store);
    });
  }
  // @Cron('30 * * * * *', {
  //   name: 'myJob',
  // })
  // async checkForPayments() {
  //   console.log('지불정보를 확인하고 있습니다....(cron)');
  //   const job = this.schedulerRegistry.getCronJob('myJob');
  //   job.stop();
  // }
  // @Interval(10000)
  // async checkForPayments2() {
  //   console.log('지불정보를 확인하고 있습니다....(interval)');
  // }
  // @Timeout(20000)
  // async afterStarts() {
  //   console.log('구매해주셔서 감사합니다.');
  // }
}
