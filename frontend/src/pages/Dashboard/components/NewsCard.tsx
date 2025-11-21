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
    <Card className="w-full max-w-lg hover:cursor-pointer">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-col gap-1">
          <CardDescription>Número: {number}</CardDescription>
          <CardDescription>
            Data de apresentação: {presentationDate}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <p className="text-gray-800">{description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex w-full justify-end gap-3">
        <UfBadge uf={uf} />
        <NewsTypeBadge type={newsType} />
      </CardFooter>
    </Card>
  );
}
