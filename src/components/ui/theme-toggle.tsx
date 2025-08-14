import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className={cn(
        "absolute top-4 right-4 z-10 w-12 h-6 rounded-full",
        "bg-background/20 border border-border",
        "flex items-center p-1 transition-all duration-300"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full transition-all duration-300",
          "bg-primary shadow-sm",
          isDarkMode ? "translate-x-5 bg-yellow-400" : "translate-x-0"
        )}
      />
    </Button>
  );
};