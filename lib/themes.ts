export type AmbientEffect = 'starfield' | 'webPattern' | 'scanlines' | 'halftone' | 'none';
export type CardStyle = 'holographic' | 'ornate' | 'stark' | 'neon' | 'comic' | 'tech';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  accent: string;
  accentSecondary: string;
  danger: string;
  text: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  font: string;
  ambientEffect: AmbientEffect | AmbientEffect[];
  cardStyle: CardStyle;
}

export const themes: Theme[] = [
  {
    id: 'ot-raimi',
    name: 'OT x Raimi',
    description: 'Retro-futuristic CRT holographic. Deep navy meets amber gold with lightsaber blue.',
    colors: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      accent: '#f5a623',
      accentSecondary: '#4fc3f7',
      danger: '#c0392b',
      text: '#e6edf3',
      textSecondary: '#8b949e',
      cardBg: 'rgba(22, 27, 34, 0.85)',
      cardBorder: 'rgba(245, 166, 35, 0.3)',
    },
    font: 'JetBrains Mono',
    ambientEffect: ['starfield', 'scanlines'],
    cardStyle: 'holographic',
  },
  {
    id: 'prequel',
    name: 'Prequel Era',
    description: 'Ornate and elegant. Coruscant gold, Jedi brown, and Senate blue.',
    colors: {
      bg: '#1a1208',
      bgSecondary: '#231a0e',
      accent: '#c9a44a',
      accentSecondary: '#1565c0',
      danger: '#ff5722',
      text: '#f5e6c8',
      textSecondary: '#a08060',
      cardBg: 'rgba(35, 26, 14, 0.88)',
      cardBorder: 'rgba(201, 164, 74, 0.35)',
    },
    font: 'Cinzel',
    ambientEffect: 'starfield',
    cardStyle: 'ornate',
  },
  {
    id: 'sequel',
    name: 'Sequel Era',
    description: 'Stark and minimal. First Order black with resistance orange and icy blue.',
    colors: {
      bg: '#121212',
      bgSecondary: '#1e1e1e',
      accent: '#ff8f00',
      accentSecondary: '#81d4fa',
      danger: '#f44336',
      text: '#d4c5a9',
      textSecondary: '#757575',
      cardBg: 'rgba(30, 30, 30, 0.90)',
      cardBorder: 'rgba(255, 143, 0, 0.25)',
    },
    font: 'Rajdhani',
    ambientEffect: 'starfield',
    cardStyle: 'stark',
  },
  {
    id: 'webb-verse',
    name: 'Webb-Verse',
    description: 'Sleek neon aesthetic. Electric blue and neon yellow on dark navy.',
    colors: {
      bg: '#1a237e',
      bgSecondary: '#1e2a8e',
      accent: '#fdd835',
      accentSecondary: '#2196f3',
      danger: '#f44336',
      text: '#e8eaf6',
      textSecondary: '#9fa8da',
      cardBg: 'rgba(26, 35, 126, 0.85)',
      cardBorder: 'rgba(253, 216, 53, 0.4)',
    },
    font: 'Exo 2',
    ambientEffect: 'webPattern',
    cardStyle: 'neon',
  },
  {
    id: 'spider-verse',
    name: 'Spider-Verse',
    description: 'Pop-art comic book energy. Hot pink, cyan, and purple on comic black.',
    colors: {
      bg: '#1a1a2e',
      bgSecondary: '#16213e',
      accent: '#ff1744',
      accentSecondary: '#00e5ff',
      danger: '#ff1744',
      text: '#ffffff',
      textSecondary: '#b0bec5',
      cardBg: 'rgba(26, 26, 46, 0.90)',
      cardBorder: 'rgba(255, 23, 68, 0.45)',
    },
    font: 'Bangers',
    ambientEffect: ['halftone', 'webPattern'],
    cardStyle: 'comic',
  },
  {
    id: 'mcu-spider',
    name: 'MCU Spider',
    description: 'Clean Stark tech aesthetic. Stark red, tech blue, and iron grey.',
    colors: {
      bg: '#212121',
      bgSecondary: '#263238',
      accent: '#d32f2f',
      accentSecondary: '#42a5f5',
      danger: '#d32f2f',
      text: '#eceff1',
      textSecondary: '#90a4ae',
      cardBg: 'rgba(38, 50, 56, 0.88)',
      cardBorder: 'rgba(66, 165, 245, 0.3)',
    },
    font: 'Inter',
    ambientEffect: 'webPattern',
    cardStyle: 'tech',
  },
];

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
