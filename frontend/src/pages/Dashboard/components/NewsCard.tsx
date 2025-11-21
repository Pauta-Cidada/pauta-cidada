import NewsTypeBadge, { type NewsType } from '@/components/NewsTypeBadge';
import UfBadge, { type UfBadge as UfBadgeType } from '@/components/UfBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Hash, Calendar } from 'lucide-react';

export interface NewsCardProps {
  number: string | number;
  presentationDate: string;
  description: string;
  uf: UfBadgeType;
  newsType: NewsType;
  title?: string;
}

export default function NewsCard({
  number,
  presentationDate,
  description,
  uf,
  newsType,
  title = 'Título gerado pelo modelo para a notícia',
}: NewsCardProps) {
  return (
    <Card className="w-full max-w-lg hover:cursor-pointer group dark border-white/10 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="group-hover:text-purple-400 transition-colors">
          {title}
        </CardTitle>
        <div className="flex flex-col gap-2 mt-2">
          <CardDescription className="flex items-center gap-2">
            <Hash className="size-3.5" />
            <span>Número: {number}</span>
          </CardDescription>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="size-3.5" />
            <span>Data de apresentação: {presentationDate}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex w-full justify-end gap-3">
        <UfBadge uf={uf} />
        <NewsTypeBadge type={newsType} />
      </CardFooter>
    </Card>
  );
}
