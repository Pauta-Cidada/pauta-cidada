import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CardTitleWithHelp from './CardTitleWithHelp';
import * as React from 'react';

interface ContentPanelProps {
  title: string;
  helpText: string;
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
}

export default function ContentPanel({
  title,
  helpText,
  children,
  contentClassName = '',
  className = '',
}: ContentPanelProps) {
  return (
    <Card
      className={`h-full dark border-white/10 bg-card/50 hover:cursor-text hover:scale-100 flex flex-col py-0 overflow-hidden ${className}`}
    >
      <CardHeader className="flex-shrink-0 pt-6">
        <CardTitleWithHelp title={title} helpText={helpText} />
      </CardHeader>
      <CardContent className={`flex-1 min-h-0 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
