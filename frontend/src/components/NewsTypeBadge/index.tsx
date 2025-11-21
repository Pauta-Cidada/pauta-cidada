import { Badge } from '@/components/ui/badge';

export type NewsType = 'pl' | 'pec';

interface NewsTypeBadgeProps {
  type: NewsType;
  dot?: boolean;
}

const NewsTypeDictionary = {
  pl: 'Projeto de Lei',
  pec: 'Proposta de Emenda à Constituição',
};

const dotColor = {
  pl: 'bg-blue-500',
  pec: 'bg-orange-500',
};

export default function NewsTypeBadge({
  type,
  dot = true,
  ...props
}: NewsTypeBadgeProps) {
  return (
    <Badge {...props} variant="outline">
      {dot && <div className={`w-2 h-2 mr-2 rounded-full ${dotColor[type]}`} />}
      {NewsTypeDictionary[type]}
    </Badge>
  );
}
