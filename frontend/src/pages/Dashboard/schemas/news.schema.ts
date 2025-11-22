import { z } from 'zod';

export const newsSchema = z.object({
  keywords: z.string().optional(),
  uf: z
    .enum([
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ])
    .optional(),
  type: z.string().optional(),
});

export type NewsSchemaDto = z.infer<typeof newsSchema>;
