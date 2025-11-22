import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AuthorTypeBadgeProps
  extends React.ComponentPropsWithoutRef<typeof Badge> {
  authorType: string;
  dot?: boolean;
}

export default function AuthorTypeBadge({
  authorType,
  dot = true,
  className,
  ...props
}: AuthorTypeBadgeProps) {
  return (
    <Badge
      {...props}
      className={cn(
        'bg-green-700 text-white font-semibold hover:cursor-pointer border-transparent',
        className,
      )}
    >
      {dot && <div className="w-2 h-2 rounded-full bg-white" />}
      Tipo do Autor: {authorType}
    </Badge>
  );
}
