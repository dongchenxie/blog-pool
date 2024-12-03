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
  typography: TypographyStyles;
}

interface TypographyStyles {
  h1: {
    fontSize: string;
    marginBottom: string;
    fontWeight: string;
    letterSpacing: string;
  };
  h2: {
    fontSize: string;
    marginTop: string;
    marginBottom: string;
    fontWeight: string;
  };
  h3: {
    fontSize: string;
    marginTop: string;
    marginBottom: string;
    fontWeight: string;
  };
  paragraph: {
    fontSize: string;
    lineHeight: string;
    marginBottom: string;
  };
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
  const baseSpacingIndex = parseInt(hash.slice(8, 10), 16) % spacingUnits.length;
  const radiusIndex = parseInt(hash.slice(10, 12), 16) % borderRadii.length;
  const containerIndex = parseInt(hash.slice(12, 14), 16) % containerWidths.length;

  // Add typography variation arrays
  const fontSizes = ['1.8rem', '2rem', '2.2rem', '2.4rem', '2.6rem'];
  const margins = ['1rem', '1.5rem', '2rem', '2.5rem', '3rem'];
  const fontWeights = ['500', '600', '700', '800', '900'];
  const lineHeights = ['1.4', '1.5', '1.6', '1.7', '1.8'];
  const letterSpacings = ['-0.5px', '-0.25px', '0', '0.25px', '0.5px'];

  // Generate indices for typography variations
  const h1Index = parseInt(hash.slice(14, 16), 16) % fontSizes.length;
  const h2Index = parseInt(hash.slice(16, 18), 16) % fontSizes.length;
  const h3Index = parseInt(hash.slice(18, 20), 16) % fontSizes.length;
  const typographySpacingIndex = parseInt(hash.slice(20, 22), 16) % margins.length;
  const weightIndex = parseInt(hash.slice(22, 24), 16) % fontWeights.length;

  return {
    primary,
    secondary,
    accent,
    background,
    text,
    fontFamily: fonts[fontIndex],
    borderRadius: borderRadii[radiusIndex],
    spacing: spacingUnits[baseSpacingIndex],
    containerWidth: containerWidths[containerIndex],
    headerHeight: '60px',
    footerHeight: '40px',
    typography: {
      h1: {
        fontSize: fontSizes[h1Index],
        marginBottom: margins[typographySpacingIndex],
        fontWeight: fontWeights[weightIndex],
        letterSpacing: letterSpacings[h1Index],
      },
      h2: {
        fontSize: fontSizes[h2Index],
        marginTop: margins[typographySpacingIndex],
        marginBottom: margins[(typographySpacingIndex + 1) % margins.length],
        fontWeight: fontWeights[(weightIndex + 1) % fontWeights.length],
      },
      h3: {
        fontSize: fontSizes[h3Index],
        marginTop: margins[(typographySpacingIndex + 2) % margins.length],
        marginBottom: margins[(typographySpacingIndex + 3) % margins.length],
        fontWeight: fontWeights[(weightIndex + 2) % fontWeights.length],
      },
      paragraph: {
        fontSize: '1rem',
        lineHeight: lineHeights[typographySpacingIndex],
        marginBottom: margins[(typographySpacingIndex + 4) % margins.length],
      },
    },
  };
} 