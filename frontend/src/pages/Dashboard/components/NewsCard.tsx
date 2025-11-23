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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import dayjs from 'dayjs';
import { Hash, Calendar, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Link } from 'react-router';
import type { DashboardState } from '../index';
import { voteStorage, type VoteType } from '@/services/voteStorage';

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
  upvotes?: number;
  downvotes?: number;
  dashboardState?: DashboardState;
  onVote?: (newsId: string, voteType: VoteType) => void;
}

export default function NewsCard({
  id,
  number,
  presentationDate,
  description,
  uf,
  newsType,
  title = 'Título gerado pelo modelo para a notícia',
  upvotes = 0,
  downvotes = 0,
  dashboardState,
  onVote,
}: NewsCardProps) {
  // Verificar se o usuário já votou nesta notícia
  const userVote = voteStorage.getVote(id);
  const hasUpvoted = userVote === 'upvote';
  const hasDownvoted = userVote === 'downvote';

  const handleVote = (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.preventDefault();
    e.stopPropagation();

    // Verificar se o usuário já votou
    if (voteStorage.hasVoted(id)) {
      return;
    }

    // Chamar a função de votação passada pelo Dashboard
    if (onVote) {
      onVote(id, voteType);
    }
  };

  return (
    <Link
      to={`/noticia/${id}`}
      state={dashboardState}
      className="w-full max-w-lg group block"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Card className="w-full h-full hover:cursor-pointer dark border-white/10 bg-card/50 backdrop-blur-sm select-none">
        <CardHeader>
          <CardTitle className="group-hover:text-purple-400 transition-colors leading-relaxed">
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
        <CardFooter className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleVote(e, 'upvote')}
                  className={`hover:cursor-pointer flex items-center gap-1 transition-colors ${
                    hasUpvoted
                      ? 'text-green-500'
                      : 'text-muted-foreground hover:text-green-500'
                  }`}
                  aria-label="Upvote"
                  disabled={voteStorage.hasVoted(id)}
                >
                  <ArrowBigUp width={20} />
                  <span className="text-sm">{upvotes}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hasUpvoted
                    ? 'Você já votou positivamente'
                    : 'Votar positivamente nesta notícia'}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleVote(e, 'downvote')}
                  className={`hover:cursor-pointer flex items-center gap-1 transition-colors ${
                    hasDownvoted
                      ? 'text-red-500'
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                  aria-label="Downvote"
                  disabled={voteStorage.hasVoted(id)}
                >
                  <ArrowBigDown width={20} />
                  <span className="text-sm">{downvotes}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hasDownvoted
                    ? 'Você já votou negativamente'
                    : 'Votar negativamente nesta notícia'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex gap-3">
            <UfBadge uf={uf} />
            <NewsTypeBadge typeCode={newsType} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
