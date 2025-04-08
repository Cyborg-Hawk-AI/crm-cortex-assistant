# NebulaGrid Design System Documentation

## Introduction

NebulaGrid is a Matrix-themed, AI-assisted workspace for engineers. This design system outlines the visual language, component library, and interaction patterns that define the NebulaGrid experience.

The design system prioritizes:
- Focus and context switching
- Modular, expandable panels
- High contrast and legibility
- Cyberpunk, terminal-inspired aesthetic
- Responsive and adaptive layouts

## Brand Identity

### Name and Concept
- **Product Name**: NebulaGrid
- **Tagline**: Tap into the Source
- **Core Concept**: A modular hacker interface that fuses AI capabilities with a command-line inspired visual identity.

### Logo Guidelines
- Primary logo features `{}` brackets with a blinking cursor motif
- Minimum padding of 16px around the logo at all times
- Light variant (green on black) and glitch variant (white with green scan lines)
- Never stretch, distort, or rotate the logo

## Color System

### Primary Palette

#### Matrix Theme Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Matrix Green | hsl(123, 80%, 50%) | #00FF41 | Primary accent, interactive elements |
| Glitch Cyan | hsl(180, 90%, 55%) | #00FFFF | Information, links, secondary actions |
| Terminal Blue | hsl(200, 80%, 60%) | #4FD1FF | Highlighted actions, AI responses |
| Signal Yellow | hsl(50, 100%, 65%) | #FFFF00 | Warnings, alerts |
| Alert Red | hsl(0, 100%, 65%) | #FF3B3B | Destructive actions, errors |
| Neon White | hsl(0, 0%, 100%) | #FFFFFF | Highlighted foreground text |

#### Core Background Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Background | hsl(210, 30%, 8%) | #0A0F0F | Page background |
| Card | hsl(210, 20%, 12%) | #111818 | Card backgrounds |
| Border | hsl(210, 15%, 20%) | #2C2F2F | Border color |
| Foreground | hsl(120, 100%, 85%) | #C2FFD0 | Primary text |
| Muted Foreground | hsl(120, 30%, 60%) | #7ED6A7 | Secondary text |

### Functional Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Primary | hsl(123, 80%, 50%) | #00FF41 | Primary buttons, key UI elements |
| Primary Foreground | hsl(210, 30%, 8%) | #0A0F0F | Text on primary elements |
| Secondary | hsl(180, 90%, 55%) | #00FFFF | Secondary buttons, backgrounds |
| Secondary Foreground | hsl(210, 30%, 8%) | #0A0F0F | Text on secondary elements |
| Accent | hsl(200, 80%, 60%) | #4FD1FF | Accent backgrounds, highlights |
| Accent Foreground | hsl(210, 30%, 8%) | #0A0F0F | Text on accent backgrounds |
| Destructive | hsl(0, 100%, 65%) | #FF3B3B | Destructive actions, errors |
| Destructive Foreground | hsl(120, 100%, 85%) | #C2FFD0 | Text on destructive elements |

### Alert Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Alert Red | hsl(0, 100%, 65%) | #FF3B3B | Critical priority |
| Alert Orange | hsl(25, 95%, 65%) | #F97316 | High priority |
| Alert Yellow | hsl(50, 100%, 65%) | #FFFF00 | Medium priority |
| Alert Blue | hsl(200, 80%, 60%) | #4FD1FF | Information |
| Alert Green | hsl(120, 60%, 50%) | #32CD32 | Success |

### Gradient Usage Guidelines
- Buttons use gradients from vibrant green to black for depth
- Cards use subtle terminal-style matrix gradients
- Glowing effects use radial gradients with Matrix Green at 20–40% opacity
- Text headings may use linear gradients with Matrix Green/Glitch Cyan

Examples:
```css
/* Primary button gradient */
background: linear-gradient(to right, hsl(var(--matrix-green)), hsl(var(--matrix-green)/0.8));

/* Card subtle gradient */
background: linear-gradient(to bottom right, #111818, #0A0F0F);

/* Glowing border effect */
box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);

Typography
Font Families

    Primary Font: JetBrains Mono (system-monospace fallback)

    Monospace Font: SF Mono, IBM Plex Mono

Font Sizes and Weights
Name	Size	Line Height	Weight	Usage
h1	24px (1.5rem)	32px (2rem)	Bold (700)	Main page headings
h2	20px (1.25rem)	28px (1.75rem)	Bold (700)	Section headings
h3	18px (1.125rem)	26px (1.625rem)	Bold (700)	Subsection headings
h4	16px (1rem)	24px (1.5rem)	Bold (700)	Card headings
Body	16px (1rem)	24px (1.5rem)	Regular (400)	Main body text
Body Small	14px (0.875rem)	20px (1.25rem)	Regular (400)	Secondary text
Caption	12px (0.75rem)	16px (1rem)	Medium (500)	Labels, captions
Code	14px (0.875rem)	20px (1.25rem)	Regular (400)	Code blocks
Button	14px (0.875rem)	20px (1.25rem)	Medium (500)	Button text
Typography Guidelines

    Use all-caps for buttons only

    Headings use green text or gradient effects

    Monospaced text for body and interactive elements

    Line length of 65–75 characters

    Typing effect or cursor blinks optional for AI output

Iconography
Icon System

    Primary icon set: Lucide React

    Icon sizes: 16px, 20px, 24px (default), 32px

    Stroke width: 1.5px

    Icon color: Matrix Green or Glitch Cyan

    Icons animate slightly (pulse or flicker) on hover

Icon Usage Guidelines

    Minimum 8px padding around icons

    Use paired with labels where clarity needed

    Highlight interactive icons with glow or flicker

Spacing System
Base Unit

    Base unit: 4px

Spacing Scale
Name	Size	Usage
px	1px	Borders, hairlines
0.5	2px	Minimal spacing
1	4px	Tight spacing
2	8px	Default compact spacing
3	12px	Default spacing between related items
4	16px	Standard spacing between elements
5	20px	Medium spacing
6	24px	Default spacing between sections
8	32px	Large spacing
10	40px	Extra-large spacing
12	48px	Section padding
16	64px	Page padding
Border Radius
Radius Scale
Name	Size	Usage
none	0px	No rounding
sm	4px	Subtle rounding for small elements
DEFAULT	6px	Standard component rounding
md	8px	Medium rounding
lg	12px	Large rounding for prominent elements
xl	16px	Extra large rounding
full	9999px	Fully rounded (circles, pills)
Shadows and Elevation
Shadow Scale
Name	Properties	Usage
card	0 4px 8px rgba(0, 255, 65, 0.05)	Default card shadow
card-hover	0 8px 16px rgba(0, 255, 65, 0.1)	Elevated card state
button	0 2px 4px rgba(0, 255, 65, 0.1)	Button shadow
button-hover	0 4px 8px rgba(0, 255, 65, 0.15)	Elevated button state
alert	0 2px 8px rgba(255, 59, 59, 0.15)	Alert/notification shadow
neon-green	0 0 12px rgba(0, 255, 65, 0.5)	Green glow effect
neon-cyan	0 0 12px rgba(0, 255, 255, 0.5)	Cyan glow effect
neon-red	0 0 12px rgba(255, 59, 59, 0.5)	Red glow effect
Component Library

... (The rest of the component, form, navigation, modal, feedback, and accessibility sections remain identical in structure, with the updated Matrix visual style and color guidelines applied to all relevant UI states, shadows, and interactions.)


Let me know if you'd like me to continue with the rest of the markdown document covering components and interactions—or if you want a visual mockup based on this theme!

