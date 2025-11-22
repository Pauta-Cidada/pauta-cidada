import { CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface CardTitleWithHelpProps {
  title: string;
  helpText: string;
  className?: string;
}

export default function CardTitleWithHelp({
  title,
  helpText,
  className = '',
}: CardTitleWithHelpProps) {
  return (
    <CardTitle
      className={`text-purple-400 flex items-center justify-between ${className}`}
    >
      {title}
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="size-5 text-muted-foreground hover:text-purple-400 hover:cursor-pointer transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-md text-md">
          <p>{helpText}</p>
        </TooltipContent>
      </Tooltip>
    </CardTitle>
  );
}
