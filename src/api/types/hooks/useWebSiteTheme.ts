// src/api/types/hooks/website-theme.types.ts

export interface WebSiteThemeColors {
  primary: string;
  secondary?: string;
  background: string;
  text: string;
  accent?: string;
  border?: string;
  hover?: string;
  error?: string;
  success?: string;
  warning?: string;
}

export interface WebSiteTheme {
  _id: string;
  websiteId: string;
  themeName: string;
  colors: {
    light: WebSiteThemeColors;
    dark: WebSiteThemeColors;
  };
  fonts: {
    heading: {
      family: string;
      weight?: string;
      size?: string;
    };
    body: {
      family: string;
      weight?: string;
      size?: string;
    };
    accent?: {
      family: string;
      weight?: string;
      size?: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebSiteThemeDto {
  websiteId: string;
  themeName: string;
  colors: {
    light: WebSiteThemeColors;
    dark: WebSiteThemeColors;
  };
  fonts: {
    heading: {
      family: string;
      weight?: string;
      size?: string;
    };
    body: {
      family: string;
      weight?: string;
      size?: string;
    };
    accent?: {
      family: string;
      weight?: string;
      size?: string;
    };
  };
  isActive?: boolean;
}

export interface UpdateWebSiteThemeDto {
  themeName?: string;
  colors?: {
    light?: Partial<WebSiteThemeColors>;
    dark?: Partial<WebSiteThemeColors>;
  };
  fonts?: Partial<WebSiteTheme['fonts']>;
  isActive?: boolean;
}

export interface WebSiteThemeResponse {
  success: boolean;
  message: string;
  data: WebSiteTheme;
}

export interface WebSiteThemesResponse {
  success: boolean;
  message: string;
  data: WebSiteTheme[];
}

export interface PaginatedWebSiteThemesResponse {
  success: boolean;
  message: string;
  data: {
    themes: WebSiteTheme[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

// Color preset types for easy theme creation
export interface ColorPreset {
  name: string;
  translationKey: string;
  colors: {
    light: WebSiteThemeColors;
    dark: WebSiteThemeColors;
  };
}

export interface FontPreset {
  name: string;
  translationKey: string;
  fonts: WebSiteTheme['fonts'];
}

// Common color palettes with both light and dark modes
export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'Corporate Blue',
    translationKey: 'themeManagement.colorPresets.corporateBlue',
    colors: {
      light: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#212529',
        accent: '#17a2b8',
        border: '#dee2e6',
        hover: '#0056b3',
        error: '#dc3545',
        success: '#28a745',
        warning: '#ffc107'
      },
      dark: {
        primary: '#4dabf7',
        secondary: '#868e96',
        background: '#121212',
        text: '#ffffff',
        accent: '#22b8cf',
        border: '#333333',
        hover: '#339af0',
        error: '#ff6b6b',
        success: '#51cf66',
        warning: '#ffd43b'
      }
    }
  },
  {
    name: 'Emerald Nature',
    translationKey: 'themeManagement.colorPresets.emeraldNature',
    colors: {
      light: {
        primary: '#10b981',
        secondary: '#6b7280',
        background: '#ffffff',
        text: '#111827',
        accent: '#f59e0b',
        border: '#e5e7eb',
        hover: '#059669',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b'
      },
      dark: {
        primary: '#34d399',
        secondary: '#9ca3af',
        background: '#0f172a',
        text: '#f8fafc',
        accent: '#fbbf24',
        border: '#374151',
        hover: '#10b981',
        error: '#f87171',
        success: '#34d399',
        warning: '#fbbf24'
      }
    }
  },
  {
    name: 'Purple Creative',
    translationKey: 'themeManagement.colorPresets.purpleCreative',
    colors: {
      light: {
        primary: '#8b5cf6',
        secondary: '#6b7280',
        background: '#ffffff',
        text: '#111827',
        accent: '#f59e0b',
        border: '#e5e7eb',
        hover: '#7c3aed',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b'
      },
      dark: {
        primary: '#a78bfa',
        secondary: '#9ca3af',
        background: '#0c0a0a',
        text: '#f3f4f6',
        accent: '#fbbf24',
        border: '#374151',
        hover: '#8b5cf6',
        error: '#f87171',
        success: '#34d399',
        warning: '#fbbf24'
      }
    }
  },
  {
    name: 'Rose Elegant',
    translationKey: 'themeManagement.colorPresets.roseElegant',
    colors: {
      light: {
        primary: '#e11d48',
        secondary: '#64748b',
        background: '#ffffff',
        text: '#0f172a',
        accent: '#06b6d4',
        border: '#e2e8f0',
        hover: '#be185d',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#eab308'
      },
      dark: {
        primary: '#fb7185',
        secondary: '#94a3b8',
        background: '#0f0a0a',
        text: '#f1f5f9',
        accent: '#22d3ee',
        border: '#334155',
        hover: '#e11d48',
        error: '#f87171',
        success: '#4ade80',
        warning: '#facc15'
      }
    }
  }
];

// Common font combinations
export const FONT_PRESETS: FontPreset[] = [
  {
    name: 'Modern Sans',
    translationKey: 'themeManagement.fontPresets.modern',
    fonts: {
      heading: {
        family: 'Inter, sans-serif',
        weight: '700',
        size: '2rem'
      },
      body: {
        family: 'Inter, sans-serif',
        weight: '400',
        size: '1rem'
      },
      accent: {
        family: 'Inter, sans-serif',
        weight: '600',
        size: '1.125rem'
      }
    }
  },
  {
    name: 'Classic Serif',
    translationKey: 'themeManagement.fontPresets.elegant',
    fonts: {
      heading: {
        family: 'Playfair Display, serif',
        weight: '700',
        size: '2rem'
      },
      body: {
        family: 'Source Serif Pro, serif',
        weight: '400',
        size: '1rem'
      },
      accent: {
        family: 'Playfair Display, serif',
        weight: '600',
        size: '1.125rem'
      }
    }
  },
  {
    name: 'Tech Stack',
    translationKey: 'themeManagement.fontPresets.creative',
    fonts: {
      heading: {
        family: 'Roboto, sans-serif',
        weight: '700',
        size: '2rem'
      },
      body: {
        family: 'Open Sans, sans-serif',
        weight: '400',
        size: '1rem'
      },
      accent: {
        family: 'Roboto Mono, monospace',
        weight: '500',
        size: '1rem'
      }
    }
  },
  {
    name: 'Editorial',
    translationKey: 'themeManagement.fontPresets.minimal',
    fonts: {
      heading: {
        family: 'Merriweather, serif',
        weight: '700',
        size: '2rem'
      },
      body: {
        family: 'Lato, sans-serif',
        weight: '400',
        size: '1rem'
      },
      accent: {
        family: 'Merriweather, serif',
        weight: '600',
        size: '1.125rem'
      }
    }
  }
];

// Theme validation helpers
export const validateColors = (colors: Partial<WebSiteThemeColors>): boolean => {
  const required = ['primary', 'background', 'text'];
  return required.every(key => colors[key as keyof typeof colors]);
};

export const validateThemeColors = (colors: { light?: Partial<WebSiteThemeColors>; dark?: Partial<WebSiteThemeColors> }): boolean => {
  return !!(colors.light && validateColors(colors.light) && colors.dark && validateColors(colors.dark));
};

export const validateFonts = (fonts: Partial<WebSiteTheme['fonts']>): boolean => {
  return !!(fonts.heading?.family && fonts.body?.family);
};

// Theme utility functions
export const getContrastColor = (color: string): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155 ? '#000000' : '#ffffff';
};

export const generateThemeCSS = (theme: WebSiteTheme, mode: 'light' | 'dark' = 'light'): string => {
  const colors = theme.colors[mode];
  return `
    :root {
      --primary-color: ${colors.primary};
      --secondary-color: ${colors.secondary || colors.primary};
      --background-color: ${colors.background};
      --text-color: ${colors.text};
      --accent-color: ${colors.accent || colors.primary};
      --border-color: ${colors.border || '#e5e7eb'};
      --hover-color: ${colors.hover || colors.primary};
      --error-color: ${colors.error || '#ef4444'};
      --success-color: ${colors.success || '#10b981'};
      --warning-color: ${colors.warning || '#f59e0b'};
      
      --heading-font: ${theme.fonts.heading.family};
      --heading-weight: ${theme.fonts.heading.weight || '700'};
      --heading-size: ${theme.fonts.heading.size || '2rem'};
      
      --body-font: ${theme.fonts.body.family};
      --body-weight: ${theme.fonts.body.weight || '400'};
      --body-size: ${theme.fonts.body.size || '1rem'};
      
      --accent-font: ${theme.fonts.accent?.family || theme.fonts.heading.family};
      --accent-weight: ${theme.fonts.accent?.weight || '600'};
      --accent-size: ${theme.fonts.accent?.size || '1.125rem'};
    }
  `;
};

// Labels for colors - now with translation keys
export const COLOR_LABELS = {
  primary: {
    labelKey: "themeManagement.colorLabels.primary.label",
    descriptionKey: "themeManagement.colorLabels.primary.description",
    iconKey: "themeManagement.colorLabels.primary.icon"
  },
  secondary: {
    labelKey: "themeManagement.colorLabels.secondary.label",
    descriptionKey: "themeManagement.colorLabels.secondary.description", 
    iconKey: "themeManagement.colorLabels.secondary.icon"
  },
  background: {
    labelKey: "themeManagement.colorLabels.background.label",
    descriptionKey: "themeManagement.colorLabels.background.description",
    iconKey: "themeManagement.colorLabels.background.icon"
  },
  text: {
    labelKey: "themeManagement.colorLabels.text.label",
    descriptionKey: "themeManagement.colorLabels.text.description",
    iconKey: "themeManagement.colorLabels.text.icon"
  },
  accent: {
    labelKey: "themeManagement.colorLabels.accent.label",
    descriptionKey: "themeManagement.colorLabels.accent.description",
    iconKey: "themeManagement.colorLabels.accent.icon"
  },
  border: {
    labelKey: "themeManagement.colorLabels.border.label",
    descriptionKey: "themeManagement.colorLabels.border.description",
    iconKey: "themeManagement.colorLabels.border.icon"
  },
  hover: {
    labelKey: "themeManagement.colorLabels.hover.label",
    descriptionKey: "themeManagement.colorLabels.hover.description",
    iconKey: "themeManagement.colorLabels.hover.icon"
  },
  error: {
    labelKey: "themeManagement.colorLabels.error.label",
    descriptionKey: "themeManagement.colorLabels.error.description",
    iconKey: "themeManagement.colorLabels.error.icon"
  },
  success: {
    labelKey: "themeManagement.colorLabels.success.label",
    descriptionKey: "themeManagement.colorLabels.success.description",
    iconKey: "themeManagement.colorLabels.success.icon"
  },
  warning: {
    labelKey: "themeManagement.colorLabels.warning.label",
    descriptionKey: "themeManagement.colorLabels.warning.description",
    iconKey: "themeManagement.colorLabels.warning.icon"
  }
};

// User-friendly font type mapping - now with translation keys
export const FONT_TYPE_LABELS = {
  heading: {
    labelKey: "themeManagement.fontTypeLabels.heading.label",
    descriptionKey: "themeManagement.fontTypeLabels.heading.description",
    iconKey: "themeManagement.fontTypeLabels.heading.icon"
  },
  body: {
    labelKey: "themeManagement.fontTypeLabels.body.label",
    descriptionKey: "themeManagement.fontTypeLabels.body.description",
    iconKey: "themeManagement.fontTypeLabels.body.icon"
  },
  accent: {
    labelKey: "themeManagement.fontTypeLabels.accent.label",
    descriptionKey: "themeManagement.fontTypeLabels.accent.description",
    iconKey: "themeManagement.fontTypeLabels.accent.icon"
  }
};

// Font property labels - now with translation keys
export const FONT_PROPERTY_LABELS = {
  family: "themeManagement.fontPropertyLabels.family",
  weight: "themeManagement.fontPropertyLabels.weight", 
  size: "themeManagement.fontPropertyLabels.size"
};

// Color mode labels - now with translation keys
export const COLOR_MODE_LABELS = {
  light: {
    labelKey: "themeManagement.colorModeLabels.light.label",
    descriptionKey: "themeManagement.colorModeLabels.light.description",
    iconKey: "themeManagement.colorModeLabels.light.icon"
  },
  dark: {
    labelKey: "themeManagement.colorModeLabels.dark.label", 
    descriptionKey: "themeManagement.colorModeLabels.dark.description",
    iconKey: "themeManagement.colorModeLabels.dark.icon"
  }
};

// Helper functions to get translated values
export const getColorPresetName = (preset: ColorPreset, t: (key: string) => string): string => {
  return t(preset.translationKey);
};

export const getFontPresetName = (preset: FontPreset, t: (key: string) => string): string => {
  return t(preset.translationKey);
};

export const getColorLabel = (colorKey: string, t: (key: string) => string) => {
  const colorInfo = COLOR_LABELS[colorKey as keyof typeof COLOR_LABELS];
  if (!colorInfo) return { label: colorKey, description: '', icon: '' };
  
  return {
    label: t(colorInfo.labelKey),
    description: t(colorInfo.descriptionKey),
    icon: t(colorInfo.iconKey)
  };
};

export const getFontTypeLabel = (fontType: string, t: (key: string) => string) => {
  const fontInfo = FONT_TYPE_LABELS[fontType as keyof typeof FONT_TYPE_LABELS];
  if (!fontInfo) return { label: fontType, description: '', icon: '' };
  
  return {
    label: t(fontInfo.labelKey),
    description: t(fontInfo.descriptionKey),
    icon: t(fontInfo.iconKey)
  };
};

export const getFontPropertyLabel = (property: string, t: (key: string) => string): string => {
  const propertyKey = FONT_PROPERTY_LABELS[property as keyof typeof FONT_PROPERTY_LABELS];
  return propertyKey ? t(propertyKey) : property;
};

export const getColorModeLabel = (mode: string, t: (key: string) => string) => {
  const modeInfo = COLOR_MODE_LABELS[mode as keyof typeof COLOR_MODE_LABELS];
  if (!modeInfo) return { label: mode, description: '', icon: '' };
  
  return {
    label: t(modeInfo.labelKey),
    description: t(modeInfo.descriptionKey),
    icon: t(modeInfo.iconKey)
  };
};