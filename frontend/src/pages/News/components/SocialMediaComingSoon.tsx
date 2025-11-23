import { Facebook, Instagram, Linkedin } from 'lucide-react';

interface SocialMediaComingSoonProps {
  platform: 'facebook' | 'instagram' | 'linkedin' | string;
  message?: string;
}

const platformConfig = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/10 to-blue-600/5',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    bgGradient: 'from-pink-500/10 to-purple-600/5',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    bgGradient: 'from-blue-600/10 to-blue-700/5',
  },
};

export default function SocialMediaComingSoon({
  platform,
  message,
}: SocialMediaComingSoonProps) {
  const config =
    platformConfig[platform as keyof typeof platformConfig] ||
    platformConfig.facebook;

  const Icon = config.icon;
  const defaultMessage = `Posts no ${config.name} em breve, fique ligado!`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div
        className={`relative mb-6 p-8 rounded-full bg-gradient-to-br ${config.bgGradient} border border-white/10`}
      >
        <Icon className={`size-16 ${config.color}`} strokeWidth={1.5} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {config.name} - Em Breve
      </h3>

      <p className="text-muted-foreground text-center max-w-md leading-relaxed">
        {message || defaultMessage}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground/60">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <span>Funcionalidade em desenvolvimento</span>
      </div>
    </div>
  );
}
