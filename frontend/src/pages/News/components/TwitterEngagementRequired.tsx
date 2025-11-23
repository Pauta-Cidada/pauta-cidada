import { TrendingUp, Twitter } from 'lucide-react';

export default function TwitterEngagementRequired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative mb-6 p-8 rounded-full bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-white/10">
        <Twitter className="size-16 text-sky-500" strokeWidth={1.5} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
      </div>

      <div className="flex md:flex-row flex-col items-center gap-2 text-center">
        <TrendingUp className="size-5 text-orange-400" />
        <span className="text-xl font-semibold text-white mb-2">
          Engajamento Necessário
        </span>
      </div>

      <p className="text-muted-foreground text-center max-w-md leading-relaxed mb-6">
        Esta notícia ainda não atingiu a quantidade mínima de engajamento para
        gerar uma publicação no Twitter/X.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-md">
        <p className="text-sm text-white/80 mb-4 text-center">
          <strong>Ajude a amplificar esta proposta!</strong>
        </p>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Vote e compartilhe esta notícia para que ela alcance mais pessoas e
          seja publicada nas redes sociais.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground/60">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        <span>Aguardando engajamento mínimo</span>
      </div>
    </div>
  );
}
