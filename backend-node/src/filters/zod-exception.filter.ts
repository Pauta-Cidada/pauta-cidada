import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodError)
export class ZodFilter<T extends ZodError> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 400;

    // Pra erros do Zod, será retornado uam array de erros
    // Por hora, vamos retornar apenas a mensagem da primeira ocorrência dos erros

    console.log(exception.errors);

    response.status(status).json({
      // errors: exception.errors,
      message: exception.errors[0].message,
      statusCode: status,
    });
  }
}
