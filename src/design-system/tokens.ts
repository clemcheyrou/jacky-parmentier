/** Mirror of tokens.css for use in TypeScript (props, inline art colors). */
export const palette = {
  ink: '#0E2A22',
  green: '#2F7A64',
  mustard: '#F2B33D',
  paper: '#F4EFE6',
  mint: '#BFE0CC',
  mintSoft: '#DCEBE2',
  pink: '#F8D6D3',
  sage: '#B9CBC3',
} as const;

export type PaletteColor = keyof typeof palette;

/** Section color schemes. See [data-tone] rules in tokens.css. */
export type Tone = 'ink' | 'mint' | 'pink' | 'mustard' | 'paper';

export const breakpoints = { mobile: 820 } as const;
