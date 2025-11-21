import { z } from 'zod';

export const paginationSchema = z.object({
  paginate: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .default(true),
  page: z
    .union([
      z.number().int(),
      z
        .string()
        .refine((val) => /^\d+$/.test(val), {
          message: 'Insira um número de página válido para continuar',
        })
        .transform((val) => Number(val)),
    ])
    .default(1),
  perPage: z
    .union([
      z.number().int(),
      z
        .string()
        .refine((val) => /^\d+$/.test(val), {
          message:
            'Insira um número de registros por página válido para continuar',
        })
        .transform((val) => Number(val)),
    ])
    .default(50),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
