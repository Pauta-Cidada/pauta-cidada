import { PageLayout } from '@/components/Layout';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import ReactMarkdown from 'react-markdown';
import NewsTypeBadge from '@/components/NewsTypeBadge';
import UfBadge, { type UfBadge as UfBadgeType } from '@/components/UfBadge';
import AuthorTypeBadge from '@/components/AuthorTypeBadge';
import PartyBadge from '@/components/PartyBadge';
import {
  Hash,
  Calendar,
  User,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
} from 'lucide-react';
import dayjs from 'dayjs';
import ContentPanel from './components/ContentPanel';
import { ShareDialog } from './components/ShareDialog';
import TwitterEmbed from './components/TwitterEmbed';
import SocialMediaComingSoon from './components/SocialMediaComingSoon';
import { Separator } from '@/components/ui/separator';
import { api } from '@/services/api';
import type { NewsDetail } from '@/types/api.types';
import type { DashboardState } from '../Dashboard';
import { Button } from '@/components/ui/button';
import { voteStorage, type VoteType } from '@/services/voteStorage';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface NewsItemState {
  id: string;
  title: string;
  description: string;
  number: string;
  presentationDate: string;
  uf: UfBadgeType;
  newsType: string;
  nome_autor: string;
  sigla_partido: string;
  tipo_autor: string;
  pdfUrl: string;
  fullContent: string;
  upvotes: number;
  downvotes: number;
}

export default function News() {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [newsItem, setNewsItem] = useState<NewsItemState>();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const dashboardState = location.state as DashboardState | null;

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await api.get<NewsDetail>(`/api/v1/news/${id}`);

      const newsDetail = response.data;

      const mappedNews: NewsItemState = {
        id: newsDetail.id,
        title: newsDetail.title,
        description: newsDetail.summary,
        number: newsDetail.proposition_number,
        presentationDate: newsDetail.presentation_date,
        uf: newsDetail.uf_author as UfBadgeType,
        newsType: newsDetail.news_type,
        nome_autor: newsDetail.author_name,
        sigla_partido: newsDetail.party,
        tipo_autor: newsDetail.author_type,
        pdfUrl: newsDetail.pdf_storage_url,
        fullContent: newsDetail.full_content,
        upvotes: newsDetail.upvotes,
        downvotes: newsDetail.downvotes,
      };

      setNewsItem(mappedNews);
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItem(undefined);
      toast.error('Erro ao carregar notícia', {
        description: 'Não foi possível carregar a notícia. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleGoBack = useCallback(() => {
    // Tentar obter o estado do location.state ou do sessionStorage
    const storageState = JSON.parse(
      sessionStorage.getItem('dashboardState') || 'null',
    );

    const stateToPass = dashboardState || storageState;

    if (stateToPass) {
      // Navegar passando o estado
      navigate('/noticias', { state: stateToPass });

      // Limpar o sessionStorage após usar
      sessionStorage.removeItem('dashboardState');
    } else {
      // Caso contrário, apenas volta
      navigate('/noticias');
    }
  }, [navigate, dashboardState]);

  const handleVote = useCallback(
    async (voteType: VoteType) => {
      if (!newsItem) return;

      try {
        // Salvar o voto do usuário localmente
        voteStorage.setVote(newsItem.id, voteType);

        // Atualizar a contagem local da notícia
        setNewsItem((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            upvotes: voteType === 'upvote' ? prev.upvotes + 1 : prev.upvotes,
            downvotes:
              voteType === 'downvote' ? prev.downvotes + 1 : prev.downvotes,
          };
        });

        // Chamar a API em background
        await api.patch(`/api/v1/news/${newsItem.id}/vote`, {
          vote_type: voteType,
        });
      } catch (error) {
        console.error('Error voting on news:', error);

        voteStorage.removeVote(newsItem.id);

        setNewsItem((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            upvotes: voteType === 'upvote' ? prev.upvotes - 1 : prev.upvotes,
            downvotes:
              voteType === 'downvote' ? prev.downvotes - 1 : prev.downvotes,
          };
        });

        toast.error('Erro ao registrar voto', {
          description: 'Não foi possível registrar seu voto. Tente novamente.',
        });
      }
    },
    [newsItem],
  );

  const handleShare = useCallback(async () => {
    if (!newsItem) return;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile && navigator.share) {
      const shareData = {
        title: newsItem.title,
        text: newsItem.description,
        url: window.location.href,
      };

      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setIsShareDialogOpen(true);
    }
  }, [newsItem]);

  // Salvar o estado no sessionStorage quando recebê-lo
  useEffect(() => {
    if (dashboardState) {
      sessionStorage.setItem('dashboardState', JSON.stringify(dashboardState));
    }

    // Cleanup: se o componente for desmontado e não estivermos navegando de volta,
    // limpar o sessionStorage (isso acontece se o usuário navegar para outra página)
    return () => {
      // Este cleanup será executado quando o componente desmontar
      // Não fazemos nada aqui pois o cleanup real acontece no handleGoBack
      // ou no Dashboard após restaurar o estado
    };
  }, [dashboardState]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  if (loading) {
    return (
      <PageLayout className="text-white">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loading size={48} />
        </div>
      </PageLayout>
    );
  }

  if (!newsItem) {
    return (
      <PageLayout className="text-white">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
          <h1 className="text-2xl font-bold">Notícia não encontrada</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="text-white flex flex-col">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {newsItem.title}
        </h1>
        <p className="text-muted-foreground text-lg">{newsItem.description}</p>
      </div>

      {/* Por hora, vamos manter a referência de funcionalidade, mas deixar o botão oculto */}
      <Button className="hidden" onClick={handleGoBack}>
        Voltar
      </Button>

      {/* Metadados */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-md">
          <Hash className="size-4" />
          <span>Número: {newsItem.number}</span>
        </div>
        <div className="flex items-center gap-2 text-md">
          <Calendar className="size-4" />
          <span>
            Data de apresentação:{' '}
            {dayjs(newsItem.presentationDate).format('DD/MM/YYYY')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-md">
          <User className="size-4" />
          <span>Autor: {newsItem.nome_autor}</span>
        </div>
        <div className="w-full md:hidden" />
        <UfBadge uf={newsItem.uf} />
        <NewsTypeBadge typeCode={newsItem.newsType} />
        <AuthorTypeBadge authorType={newsItem.tipo_autor!} />
        <PartyBadge party={newsItem.sigla_partido!} />
      </div>

      {/* Engagement Section */}
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote('upvote')}
              className={`hover:cursor-pointer flex items-center gap-1.5 transition-colors ${
                voteStorage.getVote(newsItem.id) === 'upvote'
                  ? 'text-green-500'
                  : 'text-muted-foreground hover:text-green-500'
              }`}
              aria-label="Upvote"
              disabled={voteStorage.hasVoted(newsItem.id)}
            >
              <ArrowBigUp width={24} />
              <span className="text-base font-medium">{newsItem.upvotes}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {voteStorage.getVote(newsItem.id) === 'upvote'
                ? 'Você já votou positivamente'
                : 'Votar positivamente nesta notícia'}
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote('downvote')}
              className={`hover:cursor-pointer flex items-center gap-1.5 transition-colors ${
                voteStorage.getVote(newsItem.id) === 'downvote'
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              aria-label="Downvote"
              disabled={voteStorage.hasVoted(newsItem.id)}
            >
              <ArrowBigDown width={24} />
              <span className="text-base font-medium">
                {newsItem.downvotes}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {voteStorage.getVote(newsItem.id) === 'downvote'
                ? 'Você já votou negativamente'
                : 'Votar negativamente nesta notícia'}
            </p>
          </TooltipContent>
        </Tooltip>

        <button
          onClick={handleShare}
          className="hover:cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors ml-2"
          aria-label="Compartilhar"
        >
          <Share2 width={24} />
          <span className="text-base font-medium">Compartilhar</span>
        </button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[1000px]">
        {/* PDF Panel */}
        <ContentPanel
          title="Documento Original da Proposta"
          helpText="Este é o documento oficial da proposta legislativa, exatamente como foi apresentado pelos legisladores. Contém a linguagem jurídica e técnica original."
          contentClassName="p-0 h-full"
          className="order-2 lg:order-1 h-[600px] lg:h-full"
        >
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              newsItem.pdfUrl,
            )}&embedded=true`}
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
        </ContentPanel>

        {/* Markdown Panel */}
        <ContentPanel
          title="Conteúdo Explicado da Proposta"
          helpText="Aqui você encontra uma tradução do documento oficial em linguagem simples e acessível, facilitando o entendimento do que a proposta realmente significa para o dia a dia."
          contentClassName="prose prose-invert max-w-none p-6 overflow-y-auto"
          className="order-1 lg:order-2 h-[600px] lg:h-full"
        >
          <ReactMarkdown>{newsItem.fullContent || ''}</ReactMarkdown>
        </ContentPanel>
      </div>

      {/* Social Media Panels */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Repercussão nas Redes
        </h2>
        <p className="text-muted-foreground">
          Acompanhe a discussão e a repercussão pública sobre esta proposta nas
          redes sociais.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Twitter/X Panel - Com embedding real */}
          <ContentPanel
            title="X (Twitter)"
            helpText="Veja como esta proposta está sendo discutida no Twitter/X."
            contentClassName="p-6 flex justify-center overflow-visible"
            className="h-auto"
          >
            <TwitterEmbed tweetUrl="" />
          </ContentPanel>

          {/* Facebook Panel - Em breve */}
          <ContentPanel
            title="Facebook"
            helpText="Em breve você poderá ver as discussões sobre esta proposta no Facebook."
            contentClassName="p-0"
            className="h-auto"
          >
            <SocialMediaComingSoon platform="facebook" />
          </ContentPanel>

          {/* Instagram Panel - Em breve */}
          <ContentPanel
            title="Instagram"
            helpText="Em breve você poderá ver as discussões sobre esta proposta no Instagram."
            contentClassName="p-0"
            className="h-auto"
          >
            <SocialMediaComingSoon
              platform="instagram"
              message="Posts no Instagram em breve, fique ligado!"
            />
          </ContentPanel>

          {/* LinkedIn Panel - Em breve */}
          <ContentPanel
            title="LinkedIn"
            helpText="Em breve você poderá ver as discussões sobre esta proposta no LinkedIn."
            contentClassName="p-0"
            className="h-auto"
          >
            <SocialMediaComingSoon
              platform="linkedin"
              message="Discussões profissionais no LinkedIn em breve!"
            />
          </ContentPanel>
        </div>
      </div>

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        url={window.location.href}
        title={newsItem.title}
        description={newsItem.description}
      />
    </PageLayout>
  );
}
