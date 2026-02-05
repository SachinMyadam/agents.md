import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PermitPilot | Generative UI Hackathon</title>
        <meta
          name="description"
          content="PermitPilot is a generative UI workspace that adapts compliance plans and launch timelines based on natural language input."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PermitPilot" />
        <meta
          name="twitter:description"
          content="Adaptive permits + launch planning with Tambo-powered generative UI."
        />
        <meta name="twitter:image" content="https://agents.md/og.png" />
        <meta name="twitter:domain" content="agents.md" />
        <meta name="twitter:url" content="https://agents.md" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="PermitPilot" />
        <meta
          property="og:description"
          content="Adaptive permits + launch planning with Tambo-powered generative UI."
        />
        <meta property="og:image" content="https://agents.md/og.png" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
