import { Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="w-full mt-12">
      <Separator className="mb-8" />
      <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="flex items-center gap-2 text-purple-400/80">
          <Sparkles className="size-4" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Inteligência Artificial
          </span>
        </div>
        <p className="text-sm text-muted-foreground/60 max-w-lg leading-relaxed">
          Os conteúdos nessa página, podem ter sido gerados através de
          inteligência artificial e podem conter imprecisões. Recomendamos
          conferir os dados com as fontes oficiais e ler os documentos
          originais.
        </p>
      </div>
    </footer>
  );
}
