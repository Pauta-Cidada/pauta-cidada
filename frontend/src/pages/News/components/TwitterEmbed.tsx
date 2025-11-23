import { XEmbed } from 'react-social-media-embed';
import { useEffect, useState } from 'react';

interface TwitterEmbedProps {
  tweetUrl: string;
}

export default function TwitterEmbed({ tweetUrl }: TwitterEmbedProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      // Considera mobile se a largura for menor que 768px (breakpoint md do Tailwind)
      setIsMobile(window.innerWidth < 768);
    };

    // Verifica no mount
    checkIfMobile();

    // Adiciona listener para resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {isMobile ? (
          <XEmbed url={tweetUrl} />
        ) : (
          <XEmbed url={tweetUrl} width={450} />
        )}
      </div>
    </div>
  );
}
