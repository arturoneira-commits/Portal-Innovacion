import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.Usuario.all();
  }

  create(dto: CreateUsuarioDto) {
    return this.prisma.db.orm.public.Usuario.create({
      id: randomUUID(),
      nombre: dto.nombre,
      email: dto.email,
      rol: dto.rol,
    });
  }
}
