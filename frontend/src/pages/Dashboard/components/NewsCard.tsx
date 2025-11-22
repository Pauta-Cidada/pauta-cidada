import NewsTypeBadge from '@/components/NewsTypeBadge';
import UfBadge, { type UfBadge as UfBadgeType } from '@/components/UfBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import dayjs from 'dayjs';
import { Hash, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export interface NewsCardProps {
  id: string;
  number: string | number;
  presentationDate: string;
  description: string;
  uf: UfBadgeType;
  newsType: string;
  title?: string;
  content?: string;
  nome_autor?: string;
  sigla_partido?: string;
  tipo_autor?: string;
}

export default function NewsCard({
  id,
  number,
  presentationDate,
  description,
  uf,
  newsType,
  title = 'Título gerado pelo modelo para a notícia',
}: NewsCardProps) {
  return (
    <Link
      to={`/noticia/${id}`}
      className="w-full max-w-lg group block"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Card className="w-full h-full hover:cursor-pointer dark border-white/10 bg-card/50 backdrop-blur-sm select-none">
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
              <span>
                Data de apresentação:{' '}
                {dayjs(presentationDate).format('DD/MM/YYYY')}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex w-full justify-end gap-3">
          <UfBadge uf={uf} />
          <NewsTypeBadge typeCode={newsType} />
        </CardFooter>
      </Card>
    </Link>
  );
}
