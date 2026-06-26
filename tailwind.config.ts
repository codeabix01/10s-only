import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  		},
  		backgroundImage: {
  			'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  		},
  		boxShadow: {
  			'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  			'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
  			'xl': '0 10px 40px rgba(0, 0, 0, 0.35)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		transitionDuration: {
  			'2xs': '100ms',
  			'xs': '150ms',
  		},
  		maxWidth: {
  			'container': '1200px',
  			'container-md': '1080px',
  		},
  		fontSize: {
  			'xs': ['12px', { lineHeight: '16px' }],
  			'sm': ['14px', { lineHeight: '20px' }],
  			'base': ['16px', { lineHeight: '24px' }],
  			'lg': ['18px', { lineHeight: '28px' }],
  			'xl': ['20px', { lineHeight: '28px' }],
  			'2xl': ['24px', { lineHeight: '32px' }],
  			'3xl': ['30px', { lineHeight: '36px' }],
  			'4xl': ['36px', { lineHeight: '40px' }],
  			'5xl': ['48px', { lineHeight: '56px' }],
  			'6xl': ['60px', { lineHeight: '72px' }],
  			'7xl': ['72px', { lineHeight: '86px' }],
  			'8xl': ['96px', { lineHeight: '110px' }],
  			'9xl': ['120px', { lineHeight: '132px' }],
  		},
  		fontFamily: {
  			display: 'var(--font-display)',
  			sans: 'var(--font-sans)',
  		},
  		perspective: {
  			'1000': '1000px',
  			'500': '500px',
  		},
  		backdropBlur: {
  			'xs': '2px',
  			'sm': '4px',
  		},
  		animation: {
  			'fade-in': 'fade-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'slide-up': 'slide-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'slide-down': 'slide-down 0.6s ease-out',
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'slide-up': {
  				'0%': { opacity: '0', transform: 'translateY(40px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'slide-down': {
  				'0%': { opacity: '0', transform: 'translateY(-20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  		}
  	}
  },
  plugins: [
    tailwindcssAnimate,
    require('tailwindcss/plugin')(function({ addUtilities, theme }) {
      const newUtilities = {
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective': {
          perspective: '1000px',
        },
        '.perspective-500': {
          perspective: '500px',
        },
        '.rotate-x-12': {
          transform: 'rotateX(12deg)',
        },
        '.rotate-x-neg-12': {
          transform: 'rotateX(-12deg)',
        },
        '.rotate-y-12': {
          transform: 'rotateY(12deg)',
        },
        '.rotate-y-neg-12': {
          transform: 'rotateY(-12deg)',
        },
        '.rotate-z-6': {
          transform: 'rotateZ(6deg)',
        },
        '.rotate-z-neg-6': {
          transform: 'rotateZ(-6deg)',
        },
        '.tilt-3d': {
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
        },
      };
      addUtilities(newUtilities);
    })
  ],
};
export default config;
