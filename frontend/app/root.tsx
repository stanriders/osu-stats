import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Tooltip } from "radix-ui";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = () => {
  const title = "scores!";
  const description = "osu! score stats";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: title },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: "https://scores.stanr.info" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "theme-color", content: "#f0abfc" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="dark h-full w-full bg-background text-foreground"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          defer
          src="https://umami.stanr.info/script.js"
          data-website-id="f8a4f3fe-13fd-4ecc-90b4-aba002502bc1"
        ></script>
      </head>
      <body className="container mx-auto px-2 py-8">
        <Tooltip.Provider delayDuration={100}>
          <main>{children}</main>
        </Tooltip.Provider>
        <footer className="py-1 text-right text-xs text-white/40">
          <a href="https://osu.ppy.sh/users/7217455">Made by StanR</a> |{" "}
          <a href="https://github.com/stanriders/osustats">Source code</a> |{" "}
          <a href="https://ko-fi.com/stanr">Donate ❤</a>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Card>
      <CardHeader>{message}</CardHeader>
      <CardContent>
        <p>{details}</p>
        {stack && (
          <pre className="w-full overflow-x-auto p-4">
            <code>{stack}</code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
