import { randomUUID } from 'crypto';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toTemporalInstant } from '../common/temporal.util';
import { PrismaService } from '../prisma/prisma.service';
import { AprobarPostulacionDto } from './dto/aprobar-postulacion.dto';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';

const ESTADOS_EVALUABLES = ['enviada', 'en_revision'];

@Injectable()
export class PostulacionesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.Postulacion.all();
  }

  async create(dto: CreatePostulacionDto) {
    const convocatoria = await this.prisma.db.orm.public.Convocatoria.first({
      id: dto.convocatoriaId,
    });
    if (!convocatoria) {
      throw new NotFoundException(`No existe la convocatoria ${dto.convocatoriaId}`);
    }
    if (convocatoria.estado !== 'abierta') {
      throw new ConflictException(
        `La convocatoria está ${convocatoria.estado}; solo se puede postular a convocatorias abiertas.`,
      );
    }
    const ahora = Temporal.Now.instant();
    if (Temporal.Instant.compare(ahora, convocatoria.fechaInicio) < 0) {
      throw new ConflictException('El período de postulación de esta convocatoria aún no comienza.');
    }
    if (Temporal.Instant.compare(ahora, convocatoria.fechaCierre) > 0) {
      throw new ConflictException('El período de postulación de esta convocatoria ya cerró.');
    }

    return this.prisma.db.orm.public.Postulacion.create({
      id: randomUUID(),
      convocatoriaId: dto.convocatoriaId,
      postulanteId: dto.postulanteId,
    });
  }

  aprobar(id: string, dto: AprobarPostulacionDto) {
    return this.prisma.db.transaction(async (tx) => {
      const postulacion = await tx.orm.public.Postulacion.first({ id });
      if (!postulacion) {
        throw new NotFoundException(`No existe la postulación ${id}`);
      }
      if (!ESTADOS_EVALUABLES.includes(postulacion.estado)) {
        throw new ConflictException(
          `La postulación ya está ${postulacion.estado}; solo se pueden aprobar las enviadas o en revisión.`,
        );
      }

      await tx.orm.public.Postulacion.where({ id }).update({ estado: 'aprobada' });

      return tx.orm.public.Proyecto.create({
        id: randomUUID(),
        postulacionId: id,
        responsableId: postulacion.postulanteId,
        objetivos: dto.objetivos,
        fechaInicio: toTemporalInstant(dto.fechaInicio),
        fechaFin: dto.fechaFin ? toTemporalInstant(dto.fechaFin) : undefined,
        presupuesto: dto.presupuesto,
      });
    });
  }

  rechazar(id: string) {
    return this.prisma.db.transaction(async (tx) => {
      const postulacion = await tx.orm.public.Postulacion.first({ id });
      if (!postulacion) {
        throw new NotFoundException(`No existe la postulación ${id}`);
      }
      if (!ESTADOS_EVALUABLES.includes(postulacion.estado)) {
        throw new ConflictException(
          `La postulación ya está ${postulacion.estado}; solo se pueden rechazar las enviadas o en revisión.`,
        );
      }

      await tx.orm.public.Postulacion.where({ id }).update({ estado: 'rechazada' });

      return tx.orm.public.Postulacion.first({ id });
    });
  }
}
