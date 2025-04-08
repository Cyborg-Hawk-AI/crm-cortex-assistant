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
