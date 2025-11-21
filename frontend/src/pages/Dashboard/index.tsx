import { PageLayout } from '@/components/Layout';
import NewsCard from './components/NewsCard';
import type { NewsCardProps } from './components/NewsCard';

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
  return (
    <PageLayout className="text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsData.map((news) => (
          <NewsCard key={news.number} {...news} />
        ))}
      </div>
    </PageLayout>
  );
}
