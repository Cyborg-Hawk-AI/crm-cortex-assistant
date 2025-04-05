
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
			padding: '1rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Core Palette (Neutral-Focused) - Enhanced for better contrast
				'soft-ivory': '#F9F9F9', // Primary background
				'cool-mist': '#F0F4F8', // Secondary background - slightly darker for better contrast
				'charcoal-gray': '#333333', // Core neutral for strong contrast - slightly darker
				'medium-gray': '#9CA3AF', // Supporting neutral - adjusted for better contrast
				
				// Accent Colors - Enhanced for more vibrancy
				'teal-green': '#54C7B7', // Primary accent - more saturated
				'forest-green': '#1B3C36', // Secondary accent - darker for better contrast
				'aqua-tint': '#A5E8E4', // Light accent for hover effects - more vibrant
				
				// Enhanced Neutral Supporting Colors
				'warm-sand': '#E5E1D8', // Alternate neutral - slightly darker
				'deep-taupe': '#847D79', // Rich neutral - darker for better contrast
				
				// Additional colors for alerts and status indicators
				'alert-red': '#E05252', // Vibrant red for critical alerts
				'alert-orange': '#F97316', // Vibrant orange for high priority
				'alert-yellow': '#FBBF24', // Vibrant yellow for medium priority
				'alert-blue': '#3B82F6', // Vibrant blue for info
				'alert-green': '#10B981', // Vibrant green for success
				
				// Mapping to Shadcn variables
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                // Neon colors
                'neon-red': 'hsl(var(--neon-red))',
                'neon-purple': 'hsl(var(--neon-purple))',
                'neon-blue': 'hsl(var(--neon-blue))',
                'neon-aqua': 'hsl(var(--neon-aqua))',
                'neon-green': 'hsl(var(--neon-green))',
                'neon-yellow': 'hsl(var(--neon-yellow))',
			},
			fontFamily: {
				sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'monospace'],
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
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				progress: {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				typing: {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				blink: {
					'50%': { borderColor: 'transparent' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'pulse': 'pulse 1.5s infinite',
				'progress': 'progress 1s ease-out forwards',
				'typing': 'typing 2s steps(20, end) forwards',
				'cursor': 'blink 1s infinite'
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)'
			},
			boxShadow: {
				'card': '0 4px 8px rgba(0, 0, 0, 0.05)',
				'card-hover': '0 8px 16px rgba(0, 0, 0, 0.1)',
				'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
				'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
				'alert': '0 2px 8px rgba(0, 0, 0, 0.15)',
				'neon-purple': '0 0 12px rgba(168, 85, 247, 0.5)',
				'neon-green': '0 0 12px rgba(182, 255, 93, 0.5)',
				'neon-aqua': '0 0 12px rgba(0, 247, 239, 0.5)',
				'neon-red': '0 0 12px rgba(244, 63, 94, 0.5)',
				'neon-blue': '0 0 12px rgba(56, 189, 248, 0.5)',
				'neon-yellow': '0 0 12px rgba(251, 191, 36, 0.5)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
