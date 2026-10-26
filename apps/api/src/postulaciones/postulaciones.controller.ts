import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { AprobarPostulacionDto } from './dto/aprobar-postulacion.dto';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(
    @Inject(PostulacionesService) private readonly postulacionesService: PostulacionesService,
  ) {}

  @Get()
  findAll() {
    return this.postulacionesService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePostulacionDto) {
    return this.postulacionesService.create(dto);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string, @Body() dto: AprobarPostulacionDto) {
    return this.postulacionesService.aprobar(id, dto);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.postulacionesService.rechazar(id);
  }
}
