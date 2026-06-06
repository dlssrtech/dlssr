import './globals.css';

export const metadata = {
  title: 'DL SSR INFOTECH | Digital Solutions & Lead Generation',
  description: 'DL SSR INFOTECH builds websites, mobile apps, CRM, HRM, FinTech, blockchain, SEO, digital marketing, and complete IT services.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
