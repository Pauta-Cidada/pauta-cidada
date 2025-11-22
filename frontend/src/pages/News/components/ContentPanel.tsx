import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CardTitleWithHelp from './CardTitleWithHelp';
import * as React from 'react';

interface ContentPanelProps {
  title: string;
  helpText: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export default function ContentPanel({
  title,
  helpText,
  children,
  contentClassName = '',
}: ContentPanelProps) {
  return (
    <Card className="h-full dark border-white/10 bg-card/50 hover:cursor-text hover:scale-100">
      <CardHeader>
        <CardTitleWithHelp title={title} helpText={helpText} />
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
