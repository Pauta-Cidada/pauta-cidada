import { PageLayout } from '@/components/Layout';
import Logo from '@/assets/logo.png';
import DevsLogo from '@/assets/devs-de-impacto.png';
import Github from '@/assets/github.png';
import TwitterLogo from '@/assets/twitter.png';
import {
  BookOpen,
  Lightbulb,
  Users,
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto pb-20 space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8 mt-10">
          <img src={Logo} alt="Pauta Cidadã Logo" className="w-48 md:w-64" />
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Democratizando o Legislativo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              O Pauta Cidadã é uma plataforma de código aberto que utiliza
              Inteligência Artificial para traduzir documentos legislativos
              complexos em notícias acessíveis, conectando leis abstratas à vida
              cotidiana das pessoas.
            </p>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Problem */}
          <div className="space-y-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">O Problema</h2>
            </div>
            <ul className="space-y-6">
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-red-200">
                  Alfabetização
                </h3>
                <p className="text-muted-foreground">
                  88% dos brasileiros têm alguma dificuldade para interpretar
                  textos longos (não são "Proficientes").
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-red-200">Inclusão</h3>
                <p className="text-muted-foreground">
                  População não se sente incluída nas decisões tomadas por seus
                  representantes.
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-red-200">Volume</h3>
                <p className="text-muted-foreground">
                  Mais de 130 mil propostas analisadas pela Câmara desde 2019.
                </p>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="space-y-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">A Solução</h2>
            </div>
            <ul className="space-y-6">
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-green-200">
                  Tecnologia
                </h3>
                <p className="text-muted-foreground">
                  Utilizando inteligência artificial para tornar informações
                  relevantes acessíveis ao cidadão comum.
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-green-200">
                  Estratégia
                </h3>
                <p className="text-muted-foreground">
                  Trazer o brasileiro para o centro da discussão e dar voz para
                  decisões que importam.
                </p>
              </li>
              <li className="space-y-2">
                <h3 className="text-xl font-semibold text-green-200">
                  Alcance
                </h3>
                <p className="text-muted-foreground">
                  Entregar as contribuições da população onde os seus
                  representantes escutam.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            Nossos Pilares
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Informar',
                description:
                  'Transformar documentos legislativos brutos em notícias simples, usando IA para eliminar barreiras técnicas e entregar informação rápida.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                icon: Lightbulb,
                title: 'Compreender',
                description:
                  'Traduzir a teoria em vida real, mostrar como cada projeto sai do papel e afeta diretamente o seu dia a dia.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
              },
              {
                icon: Users,
                title: 'Engajar',
                description:
                  'Mecanismo de votação, permitindo que o cidadão saia da passividade e registre sua opinião imediata sobre cada projeto.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: Megaphone,
                title: 'Influenciar',
                description:
                  'Pautas que são sinalizadas como mais importantes, são levadas para os representantes públicos.',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
              },
            ].map((pillar, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${pillar.bg} ${pillar.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <pillar.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hackathon & Contribution Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 rounded-3xl border border-white/10">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Devs de Impacto
              </h2>
              <p className="text-muted-foreground">
                Este projeto foi desenvolvido durante o hackathon Devs de
                Impacto Online 2025.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
              <p>
                <strong>Aviso:</strong> O projeto não reflete a opinião dos
                organizadores do evento, e sim da nossa equipe participante.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="https://devsdeimpacto.imasters.com.br/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-white"
                >
                  Conheça o Hackathon
                  <ExternalLink size={16} />
                </Button>
              </a>
              <a
                href="https://github.com/Pauta-Cidada"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-white"
                >
                  <img src={Github} className="w-5 h-5" alt="Github" />
                  Contribua no Github
                </Button>
              </a>
              <a
                href="https://x.com/PautaCidada"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-white"
                >
                  <img
                    src={TwitterLogo}
                    className="w-5 h-5"
                    alt="X / Twitter"
                  />
                  Siga no X
                </Button>
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center p-8 bg-white/5 rounded-2xl">
            <img
              src={DevsLogo}
              alt="Devs de Impacto"
              className="max-w-full h-auto max-h-32 md:max-h-48 opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
