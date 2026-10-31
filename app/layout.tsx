import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ECOFARM CIRCULAR - 3D Industrial Engineering Visualization',
  description: 'High-end 3D industrial engineering visualization and digital twin of ECOFARM CIRCULAR: an intelligent agricultural biomass valorization pilot plant integrating pyrolysis, hybrid sand thermal energy storage, automated drying, and AI-assisted energy management.',
  openGraph: {
    title: 'ECOFARM CIRCULAR - 3D Industrial Engineering Visualization',
    description: 'High-end 3D industrial engineering visualization of ECOFARM CIRCULAR pilot plant.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECOFARM CIRCULAR - 3D Industrial Engineering Visualization',
    description: 'High-end 3D industrial engineering visualization of ECOFARM CIRCULAR pilot plant.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
