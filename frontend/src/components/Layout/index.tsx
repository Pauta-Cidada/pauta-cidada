import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import Menu from '../Menu';

import Footer from '../Footer';

interface LayoutProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    PropsWithChildren {}

function Layout({ children, className, ...props }: LayoutProps) {
  return (
    <div className="w-full min-h-svh bg-gray-900">
      <Menu />
      <div
        className={`w-full flex flex-col min-h-[calc(100vh-80px)] md:px-20 px-5 py-5 ${className}`}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <Footer />
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
