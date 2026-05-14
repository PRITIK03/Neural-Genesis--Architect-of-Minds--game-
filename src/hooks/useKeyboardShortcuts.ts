import { useEffect, useCallback, useState } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore when typing in input/textbox
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matchesKey = shortcut.key
          ? event.key.toLowerCase() === shortcut.key.toLowerCase()
          : false;
        const matchesCtrl = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          event.stopPropagation();
          // Execute custom handler if provided via context
          shortcut.action && console.log('Shortcut triggered:', shortcut.action);
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts for the neural puzzle game
export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { key: 'n', ctrl: true, action: 'new-network', description: 'Start new network' },
  { key: 's', ctrl: true, action: 'save-model', description: 'Save current model' },
  { key: 'o', ctrl: true, action: 'load-model', description: 'Load saved model' },
  { key: 't', action: 'toggle-training', description: 'Start/stop training' },
  { key: 'r', action: 'reset-workspace', description: 'Clear workspace' },
  { key: 'Escape', action: 'back', description: 'Go back / close' },
  { key: '1', action: 'switch-tab-layers', description: 'Switch to layers tab' },
  { key: '2', action: 'switch-tab-training', description: 'Switch to training tab' },
  { key: '3', action: 'switch-tab-config', description: 'Switch to config tab' },
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo last action' },
  { key: 'y', ctrl: true, action: 'redo', description: 'Redo action' },
  { key: 'ArrowUp', alt: true, action: 'move-layer-up', description: 'Move layer up' },
  { key: 'ArrowDown', alt: true, action: 'move-layer-down', description: 'Move layer down' },
  { key: 'Delete', action: 'delete-layer', description: 'Delete selected layer' },
  { key: 'd', ctrl: true, action: 'duplicate-layer', description: 'Duplicate selected layer' },
];

// Hook to show a keyboard shortcuts help modal
export function useShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, toggle };
}
