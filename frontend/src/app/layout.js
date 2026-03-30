import "./globals.css";

export const metadata = {
  title: "NUSTBot — AI Admissions Assistant | NUST",
  description:
    "Ask NUSTBot about NUST admissions, programs, fees, scholarships, and more. AI-powered chatbot with real-time answers from official NUST documents.",
  keywords: [
    "NUST",
    "admissions",
    "chatbot",
    "AI assistant",
    "NUST entry test",
    "NET",
    "scholarships",
    "fee structure",
    "undergraduate programs",
  ],
  authors: [{ name: "NUSTBot" }],
  openGraph: {
    title: "NUSTBot — AI Admissions Assistant",
    description:
      "Get instant answers about NUST admissions, programs, fees, and scholarships.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
