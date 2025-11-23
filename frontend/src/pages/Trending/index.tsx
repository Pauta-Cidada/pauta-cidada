import { PageLayout } from '@/components/Layout';
import NewsCard from '../Dashboard/components/NewsCard';
import type { NewsCardProps } from '../Dashboard/components/NewsCard';
import { useCallback, useEffect, useState, useRef } from 'react';
import Loading from '@/components/Loading';
import { api } from '@/services/api';
import type { NewsDetail } from '@/types/api.types';
import type { UfBadge } from '@/components/UfBadge';
import { voteStorage, type VoteType } from '@/services/voteStorage';
import { TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Trending() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState({
    initial: true,
    scroll: false,
  });

  const [news, setNews] = useState<NewsCardProps[]>([]);

  // Controle virtual de paginação
  const [virtualPage, setVirtualPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 6;

  const loadData = useCallback(async (page: number) => {
    try {
      const isInitial = page === 1;

      setLoading((prev) => ({
        ...prev,
        initial: isInitial ? true : prev.initial,
        scroll: !isInitial,
      }));

      // Calcular o limit baseado na página virtual
      const limit = page * ITEMS_PER_PAGE;

      const response = await api.get<NewsDetail[]>(
        '/api/v1/news/top/engagement',
        {
          params: {
            limit: limit,
          },
        },
      );

      const items = response.data;

      // Filtrar posts com engajamento zero (upvotes e downvotes ambos em zero)
      const filteredItems = items.filter(
        (item) => item.upvotes > 0 || item.downvotes > 0,
      );

      const mappedNews: NewsCardProps[] = filteredItems.map((newsDetail) => {
        return {
          id: newsDetail.id,
          title: newsDetail.title,
          number: newsDetail.proposition_number,
          presentationDate: newsDetail.presentation_date,
          description: newsDetail.summary,
          uf: newsDetail.uf_author as UfBadge,
          newsType: newsDetail.news_type,
          nome_autor: newsDetail.author_name,
          sigla_partido: newsDetail.party,
          tipo_autor: newsDetail.news_type,
          upvotes: newsDetail.upvotes,
          downvotes: newsDetail.downvotes,
        };
      });

      // Verificar se há mais itens para carregar
      // Se recebemos menos itens do que solicitamos, não há mais
      if (filteredItems.length < limit) {
        setHasMore(false);
      }

      setNews(mappedNews);
    } catch (error) {
      console.error('Error loading data:', error);

      if (page === 1) {
        setNews([]);
      }

      toast.error('Erro ao carregar notícias', {
        description: 'Não foi possível carregar as notícias. Tente novamente.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, initial: false, scroll: false }));
    }
  }, []);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;

      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        hasMore &&
        !loading.scroll &&
        !loading.initial
      ) {
        setVirtualPage((prev) => prev + 1);
      }
    },
    [hasMore, loading],
  );

  const handleVote = useCallback(async (newsId: string, voteType: VoteType) => {
    try {
      // Salvar o voto do usuário localmente
      voteStorage.setVote(newsId, voteType);

      // Atualizar a contagem local da notícia
      setNews((prevNews) =>
        prevNews.map((newsItem) => {
          if (newsItem.id === newsId) {
            return {
              ...newsItem,
              upvotes:
                voteType === 'upvote'
                  ? (newsItem.upvotes || 0) + 1
                  : newsItem.upvotes || 0,
              downvotes:
                voteType === 'downvote'
                  ? (newsItem.downvotes || 0) + 1
                  : newsItem.downvotes || 0,
            };
          }
          return newsItem;
        }),
      );

      await api.patch(`/api/v1/news/${newsId}/vote`, {
        vote_type: voteType,
      });
    } catch (error) {
      console.error('Error voting on news:', error);

      voteStorage.removeVote(newsId);

      setNews((prevNews) =>
        prevNews.map((newsItem) => {
          if (newsItem.id === newsId) {
            return {
              ...newsItem,
              upvotes:
                voteType === 'upvote'
                  ? (newsItem.upvotes || 0) - 1
                  : newsItem.upvotes || 0,
              downvotes:
                voteType === 'downvote'
                  ? (newsItem.downvotes || 0) - 1
                  : newsItem.downvotes || 0,
            };
          }
          return newsItem;
        }),
      );

      toast.error('Erro ao registrar voto', {
        description: 'Não foi possível registrar seu voto. Tente novamente.',
      });
    }
  }, []);

  useEffect(() => {
    loadData(virtualPage);
  }, [loadData, virtualPage]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100vh-100px)] overflow-y-auto pr-2"
      onScroll={handleScroll}
    >
      <PageLayout className="text-white">
        {loading.initial && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loading size={48} />
          </div>
        )}

        {!loading.initial && (
          <>
            <div className="w-full flex flex-col items-center gap-10 mb-16 mt-8">
              <div className="text-center space-y-2">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Descubra o que está gerando engajamento
                  </h1>
                  <TrendingUp />
                </div>
                <p className="text-muted-foreground text-lg">
                  Essas são as propostas e leis que mais estão gerando discussão
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {news.map((newsItem) => (
                <NewsCard key={newsItem.id} {...newsItem} onVote={handleVote} />
              ))}
            </div>

            {loading.scroll && (
              <div className="w-full flex justify-center py-4">
                <Loading size={32} />
              </div>
            )}

            {news.length === 0 && !loading.initial && (
              <div className="w-full flex justify-center py-8">
                <p className="text-muted-foreground text-lg text-center">
                  Nenhum post com engajamento encontrado
                </p>
              </div>
            )}
          </>
        )}
      </PageLayout>
    </div>
  );
}
