import { useCallback, useState } from 'react';

/** Copies text to the clipboard; `copied` stays true for `resetMs`. */
export function useCopy(text: string, resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked: still show feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), resetMs);
  }, [text, resetMs]);
  return { copy, copied };
}
