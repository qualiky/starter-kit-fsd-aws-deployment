import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "react-router";
import { createContext, useContext, useEffect, useState } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import { clearAuth, getUsername, isAuthenticated } from "./lib/auth";

// ---------------------------------------------------------------------------
// Auth context — consumed by child routes via useAuth()
// ---------------------------------------------------------------------------

interface AuthContextValue {
  username: string | null;
  loggedIn: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  username: null,
  loggedIn: false,
  refresh: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// HTML shell — outside router context, no hooks
// ---------------------------------------------------------------------------

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ---------------------------------------------------------------------------
// App — inside router context, owns auth state + global nav
// ---------------------------------------------------------------------------

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const refresh = () => {
    setLoggedIn(isAuthenticated());
    setUsername(getUsername());
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = () => {
    clearAuth();
    setLoggedIn(false);
    setUsername(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ username, loggedIn, refresh, logout }}>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-lg font-bold text-blue-600 tracking-tight">
          PostShare
        </Link>
        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              <span className="text-sm text-gray-500">
                Hi,{" "}
                <span className="font-medium text-gray-800">{username}</span>
              </span>
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + New Post
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------

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
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="max-w-lg mx-auto mt-20 p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{message}</h1>
      <p className="text-gray-500 mb-4">{details}</p>
      {stack && (
        <pre className="text-left text-xs bg-gray-100 rounded p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        ← Back to feed
      </Link>
    </main>
  );
}
