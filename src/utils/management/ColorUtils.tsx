import { ColorExtractionResult } from "@/src/api/types/management/ThemeManagement.type";

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

export const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h ?? 0;
    h /= 6;
  }
  
  return [h * 360, s * 100, l * 100];
}

export const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);
  
  return rgbToHex(
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  );
}

export const generateColorPalette = (dominantColors: string[]): ColorExtractionResult | null => {
  if (!dominantColors.length) return null;
  
  const primary = dominantColors[0];
  const secondary = dominantColors[1] || primary;
  
  const [primaryH, primaryS, primaryL] = hexToHsl(primary);
  const [secondaryH, secondaryS, secondaryL] = hexToHsl(secondary);
  
  // Generate a complete color scheme
  const lightColors = {
    primary: primary,
    secondary: secondary,
    accent: dominantColors[2] || hslToHex(primaryH, primaryS, Math.min(primaryL + 20, 90)),
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: primary,
  };
  
  const darkColors = {
    primary: hslToHex(primaryH, primaryS, Math.max(primaryL - 10, 30)),
    secondary: hslToHex(secondaryH, secondaryS, Math.max(secondaryL - 10, 30)),
    accent: hslToHex(primaryH, primaryS, Math.max(primaryL - 5, 35)),
    background: "#020817",
    foreground: "#f8fafc",
    card: "#020817",
    cardForeground: "#f8fafc",
    popover: "#020817",
    popoverForeground: "#f8fafc",
    muted: "#0f172a",
    mutedForeground: "#64748b",
    border: "#1e293b",
    input: "#1e293b",
    ring: hslToHex(primaryH, primaryS, Math.max(primaryL - 10, 30)),
  };
  
  return {
    light: lightColors,
    dark: darkColors,
    dominantColors: dominantColors.slice(0, 6)
  };
}

export const analyzeImageColors = (imageData: ImageData): ColorExtractionResult | null => {
  const pixels = imageData.data;
  const colorMap = new Map();
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Group similar colors (reduce precision)
    const key = `${Math.floor(r / 8) * 8},${Math.floor(g / 8) * 8},${Math.floor(b / 8) * 8}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  
  // Sort by frequency and get dominant colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return rgbToHex(r, g, b);
    });
  
  return generateColorPalette(sortedColors);
}

export const extractColorsFromImage = (imageUrl: string): Promise<ColorExtractionResult> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = analyzeImageColors(imageData);
        if (colors) {
          resolve(colors);
        } else {
          reject(new Error("Failed to extract colors"));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}