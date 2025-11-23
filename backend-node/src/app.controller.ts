import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('API')
export class AppController {
  constructor() {}

  @ApiOperation({
    summary: 'Raiz da API',
  })
  @Get()
  execute() {
    return {
      message: 'Pauta Cidadã',
    };
  }
}
