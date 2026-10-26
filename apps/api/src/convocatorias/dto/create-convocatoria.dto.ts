import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConvocatoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  responsableId!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaCierre!: string;

  @IsOptional()
  @IsNumber()
  presupuesto?: number;

  @IsOptional()
  @IsNumber()
  montoMaximo?: number;
}
