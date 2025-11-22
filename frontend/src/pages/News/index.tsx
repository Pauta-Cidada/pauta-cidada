import { PageLayout } from '@/components/Layout';
import { useParams } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { newsData } from '@/mocks/newsData';
import type { NewsCardProps } from '@/pages/Dashboard/components/NewsCard';
import Loading from '@/components/Loading';
import ReactMarkdown from 'react-markdown';
import NewsTypeBadge from '@/components/NewsTypeBadge';
import UfBadge from '@/components/UfBadge';
import AuthorTypeBadge from '@/components/AuthorTypeBadge';
import PartyBadge from '@/components/PartyBadge';
import { Hash, Calendar, User } from 'lucide-react';
import ContentPanel from './components/ContentPanel';

export default function News() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [newsItem, setNewsItem] = useState<NewsCardProps>();

  const loadData = useCallback(() => {
    try {
      const item = newsData.find((n) => n.id === id);

      setNewsItem(item);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

      {/* Metadados */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-md">
          <Hash className="size-4" />
          <span>Número: {newsItem.number}</span>
        </div>
        <div className="flex items-center gap-2 text-md">
          <Calendar className="size-4" />
          <span>Data de apresentação: {newsItem.presentationDate}</span>
        </div>
        <div className="flex items-center gap-2 text-md">
          <User className="size-4" />
          <span>{newsItem.nome_autor}</span>
        </div>
        <UfBadge uf={newsItem.uf} />
        <NewsTypeBadge typeCode={newsItem.newsType} />
        <AuthorTypeBadge authorType={newsItem.tipo_autor!} />
        <PartyBadge party={newsItem.sigla_partido!} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[1000px]">
        {/* PDF Panel */}
        <ContentPanel
          title="Documento Original da Proposta"
          helpText="Este é o documento oficial da proposta legislativa, exatamente como foi apresentado pelos legisladores. Contém a linguagem jurídica e técnica original."
          contentClassName="p-0 h-full"
        >
          <iframe
            src="https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=2441800"
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
        </ContentPanel>

        {/* Markdown Panel */}
        <ContentPanel
          title="Conteúdo Explicado da Proposta"
          helpText="Aqui você encontra uma tradução do documento oficial em linguagem simples e acessível, facilitando o entendimento do que a proposta realmente significa para o dia a dia."
          contentClassName="prose prose-invert max-w-none p-6"
        >
          <ReactMarkdown>{newsItem.content || ''}</ReactMarkdown>
        </ContentPanel>
      </div>
    </PageLayout>
  );
}
