import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />

          <title>STJ - Automated Self-Managed Investment Tool</title>
          <meta
            name="description"
            content="STJ is an automation tool for self-managed investments across diverse assets, helping you optimize and streamline your investment portfolio."
          />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://simpletuja.com/" />
          <meta
            property="og:title"
            content="STJ - Automated Self-Managed Investment Tool"
          />
          <meta
            property="og:description"
            content="Automate and optimize your self-managed investments across diverse assets with STJ, the intelligent investment automation tool."
          />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://simpletuja.com/" />
          <meta
            property="twitter:title"
            content="STJ - Automated Self-Managed Investment Tool"
          />
          <meta
            property="twitter:description"
            content="Automate and optimize your self-managed investments across diverse assets with STJ, the intelligent investment automation tool."
          />

          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          <link
            rel="icon"
            type="image/png"
            href="/favicon/favicon-48x48.png"
            sizes="48x48"
          />
          <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
          <link rel="shortcut icon" href="/favicon/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <meta name="apple-mobile-web-app-title" content="STJ" />
          <link rel="manifest" href="/favicon/site.webmanifest" />
        </Head>
        <body className="dark bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
