/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, type PropsWithChildren } from 'react';
import copy from 'copy-to-clipboard';
import { toast } from 'sonner';

interface CopyContextValues {
  copyToClipboard: (content: string) => void;
}

export const CopyContext = createContext<CopyContextValues>({
  copyToClipboard: () => {},
});

export const CopyProvider = ({ children }: PropsWithChildren) => {
  const copyToClipboard = useCallback(async (content: string) => {
    if (!content) return;

    try {
      copy(content);

      toast('Texto copiado', {
        description: 'O texto foi copiado para a sua área de transferência.',
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <CopyContext.Provider
      value={{
        copyToClipboard,
      }}
    >
      {children}
    </CopyContext.Provider>
  );
};
