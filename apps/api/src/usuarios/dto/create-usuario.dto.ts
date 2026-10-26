import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum RolUsuarioDto {
  ADMINISTRADOR = 'administrador',
  EVALUADOR = 'evaluador',
  POSTULANTE = 'postulante',
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsEnum(RolUsuarioDto)
  rol!: RolUsuarioDto;
}
