import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import * as React from 'react';
import newsTypes from './types.json';
import { cn } from '@/lib/utils';

interface NewsTypeBadgeProps
  extends React.ComponentPropsWithoutRef<typeof Badge> {
  typeCode: string;
  dot?: boolean;
}

const newsTypeMap = new Map(
  newsTypes.dados.map((type) => [
    type.cod,
    {
      sigla: type.sigla,
      nome: type.nome,
    },
  ]),
);

export default function NewsTypeBadge({
  typeCode,
  dot = true,
  className,
  ...props
}: NewsTypeBadgeProps) {
  const newsType = newsTypeMap.get(typeCode);

  if (!newsType || !newsType.sigla) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          {...props}
          className={cn(
            'bg-orange-700 text-white font-semibold hover:cursor-pointer',
            className,
          )}
        >
          {dot && <div className="w-2 h-2 rounded-full bg-white" />}
          Tipo: {newsType.sigla}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{newsType.nome}</p>
      </TooltipContent>
    </Tooltip>
  );
}
