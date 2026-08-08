"use client";

import { useEffect, useState } from "react";
import { Sun, Monitor, Moon } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "system", label: "Match system", Icon: Monitor },
  { value: "dark", label: "Dark mode", Icon: Moon },
];

const applyTheme = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", theme === "light");
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem("jacketscore-theme") || "system";
    setTheme(stored);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if ((localStorage.getItem("jacketscore-theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const selectTheme = (value) => {
    setTheme(value);
    localStorage.setItem("jacketscore-theme", value);
    applyTheme(value);
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white/80 p-0.5 dark:border-gray-700 dark:bg-black/40">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => selectTheme(value)}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            theme === value
              ? "bg-gray-800 text-white dark:bg-white dark:text-black"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
