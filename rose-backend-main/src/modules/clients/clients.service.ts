import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
  ) {}

  async createClient(fullName: string, phone: string) {
    let client = await this.checkExistByPhone(phone);
    if (!client) {
      client = new ClientEntity();
      client.fullName = fullName;
      client.phone = phone;
      return this.clientRepository.save(client);
    }
    return client;
  }

  async checkExistByPhone(phone: string) {
    return await this.clientRepository.findOneBy({ phone });
  }
}
