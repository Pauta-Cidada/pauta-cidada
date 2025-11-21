import { CopyContext } from '@/context/CopyContext';
import { useContext } from 'react';

export const useCopy = () => useContext(CopyContext);
