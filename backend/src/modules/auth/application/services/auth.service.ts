import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../../../modules/flow/presentation/dtos/login.dto';

@Injectable()
export class AuthService {
  // Simulamos una tabla de usuarios. 
  // En producción, esto se reemplazaría por un llamado al Repositorio de Usuarios.
  private readonly mockUsers = [
    {
      id: 'admin-123',
      email: 'admin@governance.com',
      // Encriptamos la contraseña "Admin123!" simulando que así vino de la DB
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      role: 'ADMIN',
    }
  ];

  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // 1. Buscar usuario
    const user = this.mockUsers.find(u => u.email === email);
    if (!user) {
      // Usa el mismo mensaje de error para no dar pistas a atacantes
      throw new UnauthorizedException('Credenciales inválidas'); 
    }

    // 2. Comparar la contraseña ingresada con el Hash de la DB
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Si todo está bien, arma el "Payload" (los datos dentro del token)
    const payload = { 
      sub: user.id, // "sub" es el estándar JWT para el ID del usuario
      email: user.email, 
      role: user.role 
    };

    // 4. Devolver el token firmado
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        email: user.email,
        role: user.role
      }
    };
  }
}