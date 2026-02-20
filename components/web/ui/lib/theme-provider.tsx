import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";
const MEDIA = "(prefers-color-scheme: dark)";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  script?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  script = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () =>
      (typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme) : null) ||
      defaultTheme
  );

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme !== "system") return;
      const root = window.document.documentElement;
      const mode = e.matches ? "dark" : "light";
      if (!root.classList.contains(mode)) {
        root.classList.remove("light", "dark");
        root.classList.add(mode);
      }
    },
    [theme]
  );

  // Listen for system preference changes
  useEffect(() => {
    const media = window.matchMedia(MEDIA);

    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "system") {
      localStorage.removeItem(storageKey);
      const mode = window.matchMedia(MEDIA).matches ? "dark" : "light";
      if (!root.classList.contains(mode)) {
        root.classList.remove("light", "dark");
        root.classList.add(mode);
      }
      return;
    }

    localStorage.setItem(storageKey, theme);

    // Only update if the target theme is not already applied
    if (!root.classList.contains(theme)) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme, storageKey]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {script ? <ThemeScript storageKey={storageKey} /> : null}
      {children}
    </ThemeProviderContext.Provider>
  );
}

function ThemeScript({ storageKey }: { readonly storageKey: string }) {
  const code = `(() => {
  const key = ${JSON.stringify(storageKey)};
  const stored = localStorage.getItem(key);
  const system = window.matchMedia(${JSON.stringify(MEDIA)}).matches;
  const isDark = stored === "dark" || ((stored === null || stored === "system") && system);
  const mode = isDark ? "dark" : "light";
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
