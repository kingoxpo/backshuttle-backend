import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateStoreDto } from "./dtos/create-store.dto";
import { UpdateStoreDto } from "./dtos/update-store.dto";
import { Store } from "./entities/store.entity";



@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(Store)
        private readonly stores: Repository<Store>,
        ) {}

    getAll(): Promise<Store[]> {
        return this.stores.find();        
    }
    createStore (createStoreDto: CreateStoreDto,
        ): Promise<Store> {
        const newStore = this.stores.create(createStoreDto);
        return this.stores.save(newStore);
    }
    updateStore({ id, data }:UpdateStoreDto) {
        return this.stores.update(id, {...data});
    }
}