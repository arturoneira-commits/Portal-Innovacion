import { ArgumentsHost, BadRequestException, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

type PgLikeError = { code?: string; detail?: string; cause?: unknown };

// Los errores de Prisma 8 envuelven el error original de Postgres en `cause`.
// Recorremos esa cadena buscando un código SQLSTATE (5 caracteres, ej. '23505').
function findPgError(err: unknown): PgLikeError | undefined {
  let current: unknown = err;
  for (let i = 0; i < 4 && current && typeof current === 'object'; i++) {
    const candidate = current as PgLikeError;
    if (typeof candidate.code === 'string' && /^[0-9A-Z]{5}$/.test(candidate.code)) {
      return candidate;
    }
    current = candidate.cause;
  }
  return undefined;
}

@Catch()
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const pg = findPgError(exception);

    if (pg?.code === '23505') {
      const detalle = pg.detail ? ` (${pg.detail})` : '';
      return super.catch(new ConflictException(`Ya existe un registro con ese valor único${detalle}`), host);
    }

    if (pg?.code === '23503') {
      return super.catch(
        new BadRequestException('Una de las referencias apunta a un registro que no existe.'),
        host,
      );
    }

    return super.catch(exception, host);
  }
}
