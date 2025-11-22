import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
          <DialogContent className="max-w-[90%] rounded-lg dark bg-slate-950 border-slate-800 text-slate-50">
            <DialogHeader className="text-left">
              {title && (
                <DialogTitle className="text-xl text-purple-400">
                  {title}
                </DialogTitle>
              )}
              <DialogDescription className="pt-4 text-md leading-relaxed text-slate-300">
                {helpText}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  className="w-full mt-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  Voltar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
