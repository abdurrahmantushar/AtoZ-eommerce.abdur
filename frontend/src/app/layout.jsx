import "./globals.css";

export const metadata = {
  title: "AtoZ — Everything in One Place",
  description:
    "A modern A-to-Z ecommerce marketplace for discovering products across every category.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}