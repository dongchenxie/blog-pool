import { createHash } from 'crypto';

export interface ThemeStyles {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
  containerWidth: string;
  headerHeight: string;
  footerHeight: string;
}

export function generateThemeFromHost(host: string): ThemeStyles {
  const hash = createHash('md5').update(host).digest('hex');
  
  // Generate more diverse color palettes
  const hue = parseInt(hash.slice(0, 2), 16);
  const saturation = 30 + (parseInt(hash.slice(2, 4), 16) % 70);
  const lightness = 40 + (parseInt(hash.slice(4, 6), 16) % 40);
  
  const primary = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const secondary = `hsl(${(hue + 120) % 360}, ${saturation}%, ${lightness}%)`;
  const accent = `hsl(${(hue + 240) % 360}, ${saturation}%, ${lightness}%)`;
  const background = `hsl(${hue}, ${saturation * 0.2}%, 95%)`;
  const text = `hsl(${hue}, 10%, 20%)`;

  const fonts = [
    'Georgia, serif',
    'Helvetica, Arial, sans-serif',
    'Palatino, serif',
    'Verdana, sans-serif',
    'Courier New, monospace',
    'Trebuchet MS, sans-serif',
    'Times New Roman, serif',
    'Arial Black, sans-serif'
  ];

  const spacingUnits = ['0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem'];
  const borderRadii = ['0px', '4px', '8px', '12px', '16px', '24px', '32px'];
  const containerWidths = ['768px', '900px', '1024px', '1200px', '1400px'];
  
  const fontIndex = parseInt(hash.slice(6, 8), 16) % fonts.length;
  const spacingIndex = parseInt(hash.slice(8, 10), 16) % spacingUnits.length;
  const radiusIndex = parseInt(hash.slice(10, 12), 16) % borderRadii.length;
  const containerIndex = parseInt(hash.slice(12, 14), 16) % containerWidths.length;

  return {
    primary,
    secondary,
    accent,
    background,
    text,
    fontFamily: fonts[fontIndex],
    borderRadius: borderRadii[radiusIndex],
    spacing: spacingUnits[spacingIndex],
    containerWidth: containerWidths[containerIndex],
    headerHeight: '60px',
    footerHeight: '40px'
  };
} 