import { PageLayout } from '@/components/Layout';
import NewsCard from './components/NewsCard';
import type { NewsCardProps } from './components/NewsCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsSchema, type NewsSchemaDto } from './schemas/news.schema';
import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import UfSelector from '@/components/UfSelector';
import NewsTypeSelector from '@/components/NewsTypeSelector';
import { Search, X } from 'lucide-react';
import Loading from '@/components/Loading';
import { api } from '@/services/api';
import type {
  Proposition,
  BatchResponse,
  NewsDetail,
  PaginatedNewsResponse,
} from '@/types/api.types';
import type { AxiosResponse } from 'axios';
import type { UfBadge } from '@/components/UfBadge';
import { useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { voteStorage, type VoteType } from '@/services/voteStorage';

const mode: 'process' | 'consume' = 'consume';

export interface DashboardState {
  currentPage: number;
  keywords: string;
  uf?: string;
  type?: string;
  scrollPosition: number;
}

export default function Dashboard() {
  const location = useLocation();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isRestoringState, setIsRestoringState] = useState(false);

  const [loading, setLoading] = useState({
    initial: true,
    scroll: false,
  });

  const [news, setNews] = useState<NewsCardProps[]>([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const form = useForm<NewsSchemaDto>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      keywords: '',
      uf: undefined,
      type: undefined,
    },
  });

  const loadDataProcess = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, initial: true }));

      // Passo 1: Buscar proposições
      const propositionsResponse = await api.get<Proposition[]>(
        '/api/v1/propositions',
        {
          params: {
            page: 1,
            perPage: 3,
          },
        },
      );

      const propositions = propositionsResponse.data;

      if (!propositions || propositions.length === 0) {
        setNews([]);
        return;
      }

      // Passo 2: Processar cada proposição em batch para gerar notícias
      const batchResponse = await api.post<BatchResponse>(
        '/api/v1/news/generate/batch',
        propositions,
      );

      const batchResults = batchResponse.data;

      // Verificar se há resultados bem-sucedidos
      if (!batchResults?.results || batchResults.results.length === 0) {
        setNews([]);
        return;
      }

      // Filtrar apenas os resultados bem-sucedidos e extrair os news_ids
      const successfulResults = batchResults.results.filter(
        (result: { success: boolean; news_id: string }) =>
          result.success && result.news_id,
      );

      if (successfulResults.length === 0) {
        setNews([]);
        return;
      }

      // Passo 3: Buscar detalhes de cada notícia de forma assíncrona usando Promise.all
      const newsDetailsPromises = successfulResults.map(
        (result: { news_id: string }) =>
          api.get<NewsDetail>(`/api/v1/news/${result.news_id}`),
      );

      const newsDetailsResponses = await Promise.all(newsDetailsPromises);

      // Passo 4: Mapear os resultados para o formato dos cards
      const mappedNews: NewsCardProps[] = newsDetailsResponses.map(
        (response: AxiosResponse<NewsDetail>) => {
          const newsDetail = response.data;
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
        },
      );

      setNews(mappedNews);
    } catch (error) {
      console.error('Error loading data:', error);
      setNews([]);
      toast.error('Erro ao carregar notícias', {
        description: 'Não foi possível carregar as notícias. Tente novamente.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }
  }, []);

  const loadDataConsume = useCallback(
    async (page: number, overrideFilters?: Partial<NewsSchemaDto>) => {
      try {
        const isInitial = page === 1;

        setLoading((prev) => ({
          ...prev,
          initial: isInitial ? true : prev.initial,
          scroll: !isInitial,
        }));

        const currentFilters = form.getValues();
        const { keywords, uf, type } = {
          ...currentFilters,
          ...overrideFilters,
        };

        const response = await api.get<PaginatedNewsResponse>('/api/v1/news', {
          params: {
            page: page,
            limit: 6,
            keywords: keywords || undefined,
            uf: uf || undefined,
            news_type: type || undefined,
          },
        });

        const { items, pagination: apiPagination } = response.data;

        const mappedNews: NewsCardProps[] = items.map((newsDetail) => {
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

        setPagination((prev) => ({
          ...prev,
          totalPages: apiPagination.pages,
        }));

        if (isInitial) {
          setNews(mappedNews);
        } else {
          setNews((prev) => [...prev, ...mappedNews]);
        }
      } catch (error) {
        console.error('Error loading data:', error);

        if (page === 1) {
          setNews([]);
        }

        toast.error('Erro ao carregar notícias', {
          description:
            'Não foi possível carregar as notícias. Tente novamente.',
        });
      } finally {
        setLoading((prev) => ({ ...prev, initial: false, scroll: false }));
      }
    },
    [form],
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
      const { currentPage, totalPages } = pagination;

      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        currentPage < totalPages &&
        !loading.scroll &&
        !loading.initial
      ) {
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage + 1,
        }));
      }
    },
    [pagination, loading],
  );

  const handleSubmit = useCallback(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    form.setValue('keywords', '', { shouldValidate: true, shouldDirty: true });
    form.setValue('uf', undefined, { shouldValidate: true, shouldDirty: true });
    form.setValue('type', undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    // Force reload
    setTimeout(() => {
      loadDataConsume(1, {
        keywords: '',
        uf: undefined,
        type: undefined,
      });
    }, 0);
  }, [form, loadDataConsume]);

  const handleVote = useCallback(async (newsId: string, voteType: VoteType) => {
    try {
      voteStorage.setVote(newsId, voteType);

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

  // Restaurar estado quando voltar da página de notícia
  useEffect(() => {
    // Tentar obter o estado do location.state ou do sessionStorage
    let savedState = location.state as DashboardState | null;

    // Se não há estado no location, tentar pegar do sessionStorage
    if (!savedState) {
      const storedState = sessionStorage.getItem('dashboardState');

      if (storedState) {
        savedState = JSON.parse(storedState);
      }
    }

    if (savedState) {
      setIsRestoringState(true);

      form.reset({
        keywords: savedState.keywords,
        uf: savedState.uf as UfBadge | undefined,
        type: savedState.type,
      });

      setPagination((prev) => ({
        ...prev,
        currentPage: savedState.currentPage,
      }));

      // Restaurar posição de scroll após o carregamento
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedState.scrollPosition;
        }

        setIsRestoringState(false);

        // Limpar o sessionStorage após restaurar (apenas se veio do storage)
        if (!location.state) {
          sessionStorage.removeItem('dashboardState');
        }
      }, 100);
    }
  }, [location.state, form]);

  useEffect(() => {
    if (mode === 'consume' && !isRestoringState) {
      loadDataConsume(pagination.currentPage);
    } else if (mode === 'process' && !isRestoringState) {
      loadDataProcess();
    }
  }, [
    loadDataConsume,
    loadDataProcess,
    pagination.currentPage,
    isRestoringState,
  ]);

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
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Sobre o que você gostaria de ler hoje?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Explore as últimas propostas e leis em tramitação
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(() => {
                    handleSubmit();
                    // Force reload if page is 1
                    if (pagination.currentPage === 1) {
                      loadDataConsume(1);
                    } else {
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }
                  })}
                  className="w-full max-w-3xl space-y-8"
                >
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative group">
                              <Input
                                placeholder="Exemplo: segurança pública"
                                {...field}
                                className="w-full pl-14 pr-16 h-14 text-lg shadow-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                              />
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              <button
                                type="submit"
                                className="hover:cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all duration-300 flex items-center justify-center shadow-lg"
                                aria-label="Buscar"
                              >
                                <Search className="size-5 text-white" />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full flex justify-center">
                      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-4 w-full">
                        <FormField
                          control={form.control}
                          name="uf"
                          render={({ field }) => (
                            <FormItem className="min-w-[200px]">
                              <FormControl>
                                <UfSelector
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    if (pagination.currentPage === 1) {
                                      loadDataConsume(1, { uf: value });
                                    } else {
                                      setPagination((prev) => ({
                                        ...prev,
                                        currentPage: 1,
                                      }));
                                    }
                                  }}
                                  placeholder="Filtrar por Estado"
                                  className="w-full h-10"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem className="min-w-[200px]">
                              <FormControl>
                                <NewsTypeSelector
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    if (pagination.currentPage === 1) {
                                      loadDataConsume(1, { type: value });
                                    } else {
                                      setPagination((prev) => ({
                                        ...prev,
                                        currentPage: 1,
                                      }));
                                    }
                                  }}
                                  placeholder="Filtrar por Tipo"
                                  className="w-full h-10"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="icon"
                              onClick={handleClearFilters}
                              aria-label="Limpar filtros"
                            >
                              <span className="md:hidden">Limpar busca</span>
                              <X />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Limpar busca</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {news.map((newsItem) => {
                const dashboardState: DashboardState = {
                  currentPage: pagination.currentPage,
                  keywords: form.getValues('keywords') || '',
                  uf: form.getValues('uf'),
                  type: form.getValues('type'),
                  scrollPosition: scrollContainerRef.current?.scrollTop || 0,
                };

                return (
                  <NewsCard
                    key={newsItem.number}
                    {...newsItem}
                    dashboardState={dashboardState}
                    onVote={handleVote}
                  />
                );
              })}
            </div>

            {loading.scroll && (
              <div className="w-full flex justify-center py-4">
                <Loading size={32} />
              </div>
            )}
          </>
        )}
      </PageLayout>
    </div>
  );
}
