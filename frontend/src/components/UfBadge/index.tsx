import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

export type UfBadge =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

interface UfBadgeBadgeProps
  extends React.ComponentPropsWithoutRef<typeof Badge> {
  uf: UfBadge;
  dot?: boolean;
}

const UfBadgeDictionary: Record<UfBadge, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export default function UfBadge({
  uf,
  dot = true,
  className,
  ...props
}: UfBadgeBadgeProps) {
  return (
    <Badge
      {...props}
      className={cn('bg-purple-500 text-white border-purple-500', className)}
    >
      {dot && 
      <div className="w-2 h-2 mr-2 rounded-full bg-white" />}
      {UfBadgeDictionary[uf]}
    </Badge>
  );
}
