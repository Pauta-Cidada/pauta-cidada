import { PageLayout } from '@/components/Layout';
import NewsCard from './components/NewsCard';
import type { NewsCardProps } from './components/NewsCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsSchema, type NewsSchemaDto } from './schemas/news.schema';
import { useCallback, useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import UfSelector from '@/components/UfSelector';
import NewsTypeSelector from '@/components/NewsTypeSelector';
import { Search } from 'lucide-react';
import Loading from '@/components/Loading';

const newsData: NewsCardProps[] = [
  {
    number: '123123',
    presentationDate: '01/12/2025',
    description:
      'Proposta que visa estabelecer novas diretrizes para a proteção de dados pessoais no ambiente digital, ampliando os direitos dos cidadãos e as responsabilidades das empresas que coletam e processam informações.',
    uf: 'SP',
    newsType: 'pec',
    title: 'Proteção de Dados Pessoais no Ambiente Digital',
  },
  {
    number: '456789',
    presentationDate: '15/11/2025',
    description:
      'Projeto que estabelece incentivos fiscais para empresas que investirem em tecnologias sustentáveis e energias renováveis, promovendo a transição energética e a redução de emissões de carbono.',
    uf: 'RJ',
    newsType: 'pl',
    title: 'Incentivos para Energias Renováveis',
  },
  {
    number: '789012',
    presentationDate: '20/10/2025',
    description:
      'Proposta de emenda constitucional que visa reformular o sistema educacional brasileiro, garantindo maior autonomia para estados e municípios na gestão de recursos e políticas educacionais.',
    uf: 'MG',
    newsType: 'pec',
    title: 'Reforma do Sistema Educacional',
  },
  {
    number: '234567',
    presentationDate: '05/11/2025',
    description:
      'Projeto de lei que regulamenta o trabalho remoto no Brasil, estabelecendo direitos e deveres tanto para empregadores quanto para empregados, incluindo questões de infraestrutura e jornada de trabalho.',
    uf: 'RS',
    newsType: 'pl',
    title: 'Regulamentação do Trabalho Remoto',
  },
  {
    number: '345678',
    presentationDate: '10/12/2025',
    description:
      'Proposta que cria um programa nacional de combate à fome e à insegurança alimentar, com foco em populações vulneráveis e comunidades rurais, garantindo acesso a alimentos de qualidade.',
    uf: 'BA',
    newsType: 'pec',
    title: 'Programa Nacional de Combate à Fome',
  },
  {
    number: '567890',
    presentationDate: '25/09/2025',
    description:
      'Projeto que estabelece novas regras para o transporte público urbano, incentivando a modernização da frota com veículos elétricos e a melhoria da qualidade dos serviços prestados à população.',
    uf: 'PR',
    newsType: 'pl',
    title: 'Modernização do Transporte Público',
  },
  {
    number: '678901',
    presentationDate: '18/11/2025',
    description:
      'Proposta de emenda que visa fortalecer o Sistema Único de Saúde (SUS), aumentando o investimento federal e estabelecendo metas de qualidade para o atendimento à população.',
    uf: 'PE',
    newsType: 'pec',
    title: 'Fortalecimento do Sistema Único de Saúde',
  },
  {
    number: '890123',
    presentationDate: '30/10/2025',
    description:
      'Projeto de lei que cria incentivos para startups e empresas de tecnologia, reduzindo a carga tributária e facilitando o acesso a crédito para fomentar a inovação e o empreendedorismo no país.',
    uf: 'SC',
    newsType: 'pl',
    title: 'Incentivos para Startups e Inovação',
  },
  {
    number: '901234',
    presentationDate: '12/12/2025',
    description:
      'Proposta que estabelece políticas públicas para a preservação da Amazônia e outros biomas brasileiros, criando mecanismos de fiscalização e punição para crimes ambientais.',
    uf: 'AM',
    newsType: 'pec',
    title: 'Preservação da Amazônia e Biomas',
  },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsCardProps[]>([]);

  const form = useForm<NewsSchemaDto>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      keywords: '',
      uf: undefined,
      type: undefined,
    },
  });

  const loadData = useCallback(() => {
    try {
      setLoading(true);

      // Resposta irá vir da API, por hora, vamos utilizar o que temos de mock
      const response = newsData;

      setNews(response);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback((data: NewsSchemaDto) => {
    console.log('Form submitted with data:', data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <PageLayout className="text-white">
      {loading && (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loading size={48} />
        </div>
      )}

      {!loading && (
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
                onSubmit={form.handleSubmit(handleSubmit)}
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
                              placeholder="Pesquise por temas, palavras-chave ou números..."
                              {...field}
                              className="w-full pl-14 pr-16 h-14 text-lg shadow-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            <button
                              type="button"
                              onClick={() => form.handleSubmit(handleSubmit)()}
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
                    <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
                      <FormField
                        control={form.control}
                        name="uf"
                        render={({ field }) => (
                          <FormItem className="min-w-[200px]">
                            <FormControl>
                              <UfSelector
                                value={field.value}
                                onChange={field.onChange}
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
                                onChange={field.onChange}
                                placeholder="Filtrar por Tipo"
                                className="w-full h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {news.map((news) => (
              <NewsCard key={news.number} {...news} />
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
