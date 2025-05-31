// src/api/types/hooks/website-theme.types.ts


export interface WebSiteTheme {
  _id: string;
  websiteId: string;
  themeName: string;
  colors: {
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
  colors?: Partial<WebSiteTheme['colors']>;
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
  colors: WebSiteTheme['colors'];
}

export interface FontPreset {
  name: string;
  fonts: WebSiteTheme['fonts'];
}

// Common color palettes
export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'Corporate Blue',
    colors: {
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
    }
  },
  {
    name: 'Dark Mode',
    colors: {
      primary: '#bb86fc',
      secondary: '#03dac6',
      background: '#121212',
      text: '#ffffff',
      accent: '#cf6679',
      border: '#333333',
      hover: '#9965f4',
      error: '#cf6679',
      success: '#03dac6',
      warning: '#ffb74d'
    }
  },
  {
    name: 'Emerald',
    colors: {
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
    }
  },
  {
    name: 'Purple',
    colors: {
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
    }
  }
];

// Common font combinations
export const FONT_PRESETS: FontPreset[] = [
  {
    name: 'Modern Sans',
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
export const validateColors = (colors: Partial<WebSiteTheme['colors']>): boolean => {
  const required = ['primary', 'background', 'text'];
  return required.every(key => colors[key as keyof typeof colors]);
};

export const validateFonts = (fonts: Partial<WebSiteTheme['fonts']>): boolean => {
  return !!(fonts.heading?.family && fonts.body?.family);
};

// Theme utility functions
export const getContrastColor = (color: string): string => {
  // Simple contrast calculation - you might want to use a more sophisticated library
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155 ? '#000000' : '#ffffff';
};

export const generateThemeCSS = (theme: WebSiteTheme): string => {
  return `
    :root {
      --primary-color: ${theme.colors.primary};
      --secondary-color: ${theme.colors.secondary || theme.colors.primary};
      --background-color: ${theme.colors.background};
      --text-color: ${theme.colors.text};
      --accent-color: ${theme.colors.accent || theme.colors.primary};
      --border-color: ${theme.colors.border || '#e5e7eb'};
      --hover-color: ${theme.colors.hover || theme.colors.primary};
      --error-color: ${theme.colors.error || '#ef4444'};
      --success-color: ${theme.colors.success || '#10b981'};
      --warning-color: ${theme.colors.warning || '#f59e0b'};
      
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

export const COLOR_LABELS = {
  primary: {
    label: "Main Brand Color",
    description: "Your primary brand color used for buttons and highlights",
    icon: "🎨"
  },
  secondary: {
    label: "Secondary Color", 
    description: "Supporting color that complements your main brand",
    icon: "✨"
  },
  background: {
    label: "Background Color",
    description: "The main background color of your website",
    icon: "📄"
  },
  text: {
    label: "Text Color",
    description: "Color for regular text content",
    icon: "📝"
  },
  accent: {
    label: "Highlight Color",
    description: "Color for special highlights and call-to-actions",
    icon: "⭐"
  },
  border: {
    label: "Border Color",
    description: "Color for lines and borders around elements",
    icon: "🔲"
  },
  hover: {
    label: "Hover Effect Color",
    description: "Color that appears when hovering over buttons",
    icon: "👆"
  },
  error: {
    label: "Error/Warning Color",
    description: "Color for error messages and warnings",
    icon: "⚠️"
  },
  success: {
    label: "Success Color",
    description: "Color for success messages and confirmations",
    icon: "✅"
  },
  warning: {
    label: "Alert Color",
    description: "Color for important notices and alerts",
    icon: "🚨"
  }
};

// User-friendly font type mapping
export const FONT_TYPE_LABELS = {
  heading: {
    label: "Headings & Titles",
    description: "Font used for page titles and section headings",
    icon: "📰"
  },
  body: {
    label: "Body Text",
    description: "Font used for paragraphs and regular content",
    icon: "📖"
  },
  accent: {
    label: "Special Text",
    description: "Font used for quotes, captions, and special elements",
    icon: "💬"
  }
};

// Font property labels
export const FONT_PROPERTY_LABELS = {
  family: "Font Style",
  weight: "Font Thickness", 
  size: "Font Size"
};