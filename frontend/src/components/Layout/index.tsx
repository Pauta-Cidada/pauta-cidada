import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import Menu from '../Menu';

interface LayoutProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    PropsWithChildren {}

function Layout({ children, className, ...props }: LayoutProps) {
  return (
    <div className="w-svw h-svh">
      <Menu />
      <div
        className={`w-full min-h-screen flex flex-col md:px-20 px-5 py-5 bg-gray-900 ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

interface PageLayoutProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    PropsWithChildren {}

function PageLayout({ children, className, ...props }: PageLayoutProps) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {children}
    </div>
  );
}

export { Layout, PageLayout };
