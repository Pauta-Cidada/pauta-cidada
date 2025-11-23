/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PipeTransform, Injectable } from '@nestjs/common';

export type FieldParsingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'auto';

export interface ParseFormDataPipeOptions {
  /**
   * Regras de conversão para campos específicos (ex.: { price: 'number' }).
   * Campos sem regra explícita usam 'auto'.
   */
  rules?: Record<string, FieldParsingType>;
}

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  constructor(private readonly options: ParseFormDataPipeOptions = {}) {
    this.options.rules = this.options.rules || {};
  }

  transform(value: any) {
    return this.parseObject(value);
  }

  private parseObject(obj: any) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    for (const [key, raw] of Object.entries(obj)) {
      if (typeof raw === 'string') {
        const trimmed = raw.trim();

        if (trimmed === '') {
          obj[key] = undefined;
          continue;
        }

        const rule = this.options.rules![key] ?? 'auto';

        obj[key] = this.parseValue(trimmed, rule);
      } else if (typeof raw === 'object') {
        obj[key] = this.parseObject(raw);
      }
    }

    return obj;
  }

  private parseValue(value: string, type: FieldParsingType) {
    const parsers: Record<FieldParsingType, (v: string) => any> = {
      string: (v) => v,
      number: (v) => (Number.isNaN(+v) ? v : +v),
      boolean: (v) => (v === 'true' ? true : v === 'false' ? false : v),
      json: (v) => this.tryParseJson(v),
      auto: (v) => this.autoParse(v),
    };

    return parsers[type](value);
  }

  private autoParse(value: string): any {
    if (!Number.isNaN(+value)) {
      return +value;
    }

    if (value === 'true' || value === 'false') {
      return value === 'true';
    }

    return this.tryParseJson(value);
  }

  private tryParseJson(value: string): any {
    try {
      const parsed = JSON.parse(value);

      return this.parseObject(parsed);
    } catch {
      return value;
    }
  }
}
