import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ConvocatoriasService } from './convocatorias.service';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';

@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(
    @Inject(ConvocatoriasService) private readonly convocatoriasService: ConvocatoriasService,
  ) {}

  @Get()
  findAll() {
    return this.convocatoriasService.findAll();
  }

  @Post()
  create(@Body() dto: CreateConvocatoriaDto) {
    return this.convocatoriasService.create(dto);
  }
}
