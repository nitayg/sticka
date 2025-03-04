import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xxs': '375px',
				'xs': '475px',
			},
			gridTemplateColumns: {
				'15': 'repeat(15, minmax(0, 1fr))',
				'16': 'repeat(16, minmax(0, 1fr))',
				'18': 'repeat(18, minmax(0, 1fr))',
				'20': 'repeat(20, minmax(0, 1fr))',
				'22': 'repeat(22, minmax(0, 1fr))',
				'24': 'repeat(24, minmax(0, 1fr))',
				'26': 'repeat(26, minmax(0, 1fr))',
				'30': 'repeat(30, minmax(0, 1fr))',
				'36': 'repeat(36, minmax(0, 1fr))',
				'40': 'repeat(40, minmax(0, 1fr))',
				'42': 'repeat(42, minmax(0, 1fr))',
				'46': 'repeat(46, minmax(0, 1fr))',
				'48': 'repeat(48, minmax(0, 1fr))',
				'50': 'repeat(50, minmax(0, 1fr))',
				'60': 'repeat(60, minmax(0, 1fr))',
				'70': 'repeat(70, minmax(0, 1fr))',
				'80': 'repeat(80, minmax(0, 1fr))',
				'90': 'repeat(90, minmax(0, 1fr))',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
        interactive: {
          DEFAULT: 'hsl(var(--interactive))',
          hover: 'hsl(var(--interactive-hover))',
          foreground: 'hsl(var(--interactive-foreground))'
        },
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.97)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
