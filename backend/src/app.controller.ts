import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  execute() {
    return {
      message: 'Pauta Cidadã',
    };
  }
}
