import { CardTitle } from '@/components/ui/card';
import HelpButton from './HelpButton';

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
      <HelpButton title={title} helpText={helpText} />
    </CardTitle>
  );
}
