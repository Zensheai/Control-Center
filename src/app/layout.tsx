import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keys to AI | YouTube Tutorials, Tools, and Workflows",
  description:
    "The official companion hub for the Keys to AI YouTube channel, featuring practical AI tutorials, tool guides, workflow resources, and newsletter updates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
