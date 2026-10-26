import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostulacionDto {
  @IsString()
  @IsNotEmpty()
  convocatoriaId!: string;

  @IsString()
  @IsNotEmpty()
  postulanteId!: string;
}
