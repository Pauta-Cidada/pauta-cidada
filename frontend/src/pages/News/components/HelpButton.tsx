import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
  title?: string;
  helpText: string;
}

export default function HelpButton({ title, helpText }: HelpButtonProps) {
  return (
    <>
      {/* Desktop: Tooltip */}
      <div className="hidden md:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="size-5 text-muted-foreground hover:text-purple-400 hover:cursor-pointer transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="max-w-md text-md">
            <p>{helpText}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile: Dialog */}
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <HelpCircle className="size-5 text-muted-foreground hover:text-purple-400 hover:cursor-pointer transition-colors" />
          </DialogTrigger>
          <DialogContent className="max-w-[90%] rounded-lg">
            <DialogHeader className="text-left">
              {title && <DialogTitle className="text-xl">{title}</DialogTitle>}
              <DialogDescription className="pt-4 text-md leading-relaxed text-foreground">
                {helpText}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
