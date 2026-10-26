import { Controller, Get, Inject } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';

@Controller('proyectos')
export class ProyectosController {
  constructor(@Inject(ProyectosService) private readonly proyectosService: ProyectosService) {}

  @Get()
  findAll() {
    return this.proyectosService.findAll();
  }
}
