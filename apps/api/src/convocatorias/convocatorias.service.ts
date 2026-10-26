import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { toTemporalInstant } from '../common/temporal.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';

@Injectable()
export class ConvocatoriasService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.Convocatoria.all();
  }

  create(dto: CreateConvocatoriaDto) {
    return this.prisma.db.orm.public.Convocatoria.create({
      id: randomUUID(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      responsableId: dto.responsableId,
      fechaInicio: toTemporalInstant(dto.fechaInicio),
      fechaCierre: toTemporalInstant(dto.fechaCierre),
      presupuesto: dto.presupuesto,
      montoMaximo: dto.montoMaximo,
    });
  }
}
