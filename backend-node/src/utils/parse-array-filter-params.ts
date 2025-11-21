/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';

function parseArrayFilterParam(input: string | undefined, message?: string) {
  let parsed = [];

  if (input && typeof input === 'string') {
    try {
      parsed = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        throw new BadRequestException(
          message || 'Informe uma lista válida de filtros',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        message || 'Informe uma lista válida de filtros',
      );
    }
  }

  // Caso o filtro de estados já tenha sido recebido convertido
  if (input && typeof input === 'object') {
    parsed = input;
  }

  return parsed.length ? parsed : undefined;
}

export { parseArrayFilterParam };
