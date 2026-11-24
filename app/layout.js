import './globals.css';

export const metadata = {
  title: 'Case Desk | Enter Case ID',
  description: 'Keep a personal log of case references and download it as JSON.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
