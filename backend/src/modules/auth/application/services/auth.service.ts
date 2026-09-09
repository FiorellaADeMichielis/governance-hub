import { Injectable, OnModuleInit, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../../../modules/flow/presentation/dtos/login.dto';
import { UserOrmEntity } from '../../infrastructure/persistence/orm-entities/user.orm-entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedInitialUsers();
  }

  private async seedInitialUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Inicializando usuarios semilla en la base de datos (PostgreSQL)...');

      const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
      const userPasswordHash = await bcrypt.hash('User123!', 10);

      const admin = this.userRepository.create({
        email: 'admin@governance.com',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        department: 'IT / Security',
      });

      const user = this.userRepository.create({
        email: 'user@governance.com',
        passwordHash: userPasswordHash,
        role: UserRole.USER,
        department: 'Marketing',
      });

      await this.userRepository.save([admin, user]);
      this.logger.log('Usuarios semilla creados exitosamente: admin@governance.com y user@governance.com');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
    };
  }
}