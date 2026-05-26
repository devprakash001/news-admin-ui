'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/80 text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
        <span className="text-sm font-medium">Light</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/80 text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
        <span className="text-sm font-medium">Dark</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/80 text-muted-foreground hover:text-foreground'
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
        <span className="text-sm font-medium">System</span>
      </button>
    </div>
  )
}

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 sm:p-2.5 rounded-xl hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
