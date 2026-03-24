import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'TirzepBH — Peptídeos e Compostos de Alta Qualidade',
  description: 'E-commerce de peptídeos, tirzepatida e compostos de alta qualidade. Entrega rápida em BH e região, envio para todo o Brasil. Pagamento na entrega para BH.',
  keywords: 'tirzepatida, peptídeos, GHK-Cu, retatrutida, TG, Lipoless, Tirzec, Lipoland',
  openGraph: {
    title: 'TirzepBH — Peptídeos e Compostos',
    description: 'E-commerce de peptídeos e compostos de alta qualidade.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
