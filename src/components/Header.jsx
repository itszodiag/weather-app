import { CloudSun, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import { useState } from 'react';
import SettingsPanel from './SettingsPanel.jsx';

/** Application header with branding and theme switch. */
export default function Header({
  isDark,
  onToggleTheme,
  setTheme,
  temperatureUnit,
  windUnit,
  updateSettings,
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-lg"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:text-accent">
            <CloudSun className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">Weather</span>
            <span className="text-[11px] uppercase tracking-widest text-muted">
              Dashboard
            </span>
          </h1>
        </a>

        <div className="relative flex items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            type="button"
            aria-label="Open settings"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-card text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </button>
          {open ? (
            <SettingsPanel
              isDark={isDark}
              setTheme={setTheme}
              temperatureUnit={temperatureUnit}
              windUnit={windUnit}
              updateSettings={updateSettings}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
