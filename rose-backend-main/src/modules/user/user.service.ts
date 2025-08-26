import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password) {
      createUserDto.password = await this.authService.passwordMatch(
        createUserDto.password,
      );
    }
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.passwordMatch(
        updateUserDto.password,
      );
    }
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}
