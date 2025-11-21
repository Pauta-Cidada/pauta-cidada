'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { NewsType } from '@/components/NewsTypeBadge';

const TYPE_OPTIONS = [
  { value: 'pl', label: 'Projeto de Lei' },
  { value: 'pec', label: 'Proposta de Emenda à Constituição' },
];

interface NewsTypeSelectorProps {
  value?: NewsType;
  onChange: (value: NewsType | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function NewsTypeSelector({
  value,
  onChange,
  placeholder = 'Selecione o tipo',
  className,
}: NewsTypeSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-[280px] justify-between hover:text-white',
            className,
          )}
        >
          {value
            ? TYPE_OPTIONS.find((type) => type.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar tipo..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
            <CommandGroup>
              {TYPE_OPTIONS.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue as NewsType;
                    onChange(newValue === value ? undefined : newValue);
                    setOpen(false);
                  }}
                >
                  {type.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === type.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
