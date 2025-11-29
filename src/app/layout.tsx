import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AZTEAM Custom Apparel',
  description:
    'Custom apparel printing with quality and care. DTF and embroidery services for businesses and individuals.',
};

// Root layout that wraps the entire app
// The actual layout with providers is in [locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
