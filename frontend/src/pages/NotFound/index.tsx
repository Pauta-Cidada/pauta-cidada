import { PageLayout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="w-full h-[calc(100vh-7rem)] flex items-center">
        <div className="md:w-[40%] h-max  space-y-3">
          <p className="font-semibold text-white">Erro</p>
          <h1 className="font-semibold text-4xl text-white">
            Página não encontrada
          </h1>
          <p className="text-white">
            Ops! Não encontramos a página que você está procurando. Gostaria de
            voltar para a página anterior?
          </p>
          <div className="!mt-6">
            <Button size="lg" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-3" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
