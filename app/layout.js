import "./globals.css";

export const metadata = {
  title: "Variational Omni Analytics",
  description: "Community-built analytics dashboard for Variational Omni markets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
