import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  Mail,
  Facebook,
  Twitter,
  MessageCircle,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import redditLogo from '@/assets/reddit.png';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title,
  description,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copiado para a área de transferência!');
    } catch {
      toast.error('Falha ao copiar o link.');
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        const text = encodeURIComponent(`${title}\n${description}\n\n${url}`);
        window.open(
          `https://api.whatsapp.com/send/?text=${text}&type=custom_url&app_absent=0`,
          '_blank',
        );
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url,
          )}`,
          '_blank',
        );
      },
    },
    {
      name: 'X / Twitter',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      onClick: () => {
        const text = encodeURIComponent(`${title}`);
        window.open(
          `https://x.com/intent/tweet?url=${encodeURIComponent(
            url,
          )}&text=${text}`,
          '_blank',
        );
      },
    },
    {
      name: 'Reddit',
      icon: null,
      image: redditLogo,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        window.open(
          `https://www.reddit.com/submit?url=${encodeURIComponent(
            url,
          )}&title=${encodeURIComponent(title)}&type=LINK`,
          '_blank',
        );
      },
    },
    {
      name: 'E-mail',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${description}\n\n${url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white dark bg-slate-950 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-purple-500">
            Compartilhar essa notícia
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex justify-center gap-4">
            {shareLinks.map((link) => (
              <div key={link.name} className="flex flex-col items-center gap-2">
                <button
                  onClick={link.onClick}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:cursor-pointer ${link.color}`}
                  title={link.name}
                >
                  {link.icon ? (
                    <link.icon className="w-6 h-6" />
                  ) : (
                    <img
                      src={link.image}
                      alt={link.name}
                      className="w-6 h-6 object-contain invert brightness-0"
                    />
                  )}
                </button>
                <span className="text-xs text-zinc-400">{link.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
            <Input
              value={url}
              readOnly
              className="bg-transparent border-none focus-visible:ring-0 text-zinc-300 h-9"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
