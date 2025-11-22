import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface PartyBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  party: string;
  dot?: boolean;
}

export default function PartyBadge({
  party,
  dot = true,
  className,
  ...props
}: PartyBadgeProps) {
  return (
    <Badge
      {...props}
      className={cn(
        'bg-pink-700 text-white font-semibold border-transparent',
        className,
      )}
    >
      {dot && <div className="w-2 h-2 rounded-full bg-white" />}
      Partido: {party}
    </Badge>
  );
}
