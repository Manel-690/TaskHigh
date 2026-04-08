import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("th-theme") || "light",
  );

  const [accent, setAccent] = useState(
    () => localStorage.getItem("th-accent") || "purple",
  );

  useEffect(() => {
    const root = document.documentElement;

    // 🔥 RESET TOTAL (evita travar no dark)
    root.classList.remove("dark");

    if (theme === "dark") {
      root.classList.add("dark");
    }

    // 🎨 ACCENT
    root.setAttribute("data-accent", accent);

    // 💾 SALVAR
    localStorage.setItem("th-theme", theme);
    localStorage.setItem("th-accent", accent);
  }, [theme, accent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
