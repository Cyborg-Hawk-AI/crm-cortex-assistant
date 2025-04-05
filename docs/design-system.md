
# action.it Design System Documentation

## Introduction

action.it is a futuristic, AI-powered workspace for engineers. This design system documentation provides a comprehensive guide to the visual language, component library, and interaction patterns that make up the action.it experience.

The design system prioritizes:
- Focus and context switching
- Modular, expandable panels
- High contrast and legibility
- Futuristic, neon-accented aesthetic
- Responsive and adaptive layouts

## Brand Identity

### Name and Concept
- **Product Name**: action.it
- **Tagline**: Engineer's Command Center
- **Core Concept**: A modular command center that fuses modern IDE functionality with AI assistance for engineers.

### Logo Guidelines
- Primary logo features a minimalist representation combining code brackets and a terminal interface
- Minimum padding of 16px around the logo at all times
- Available in light variant (for dark backgrounds) and dark variant (for light backgrounds)
- Never stretch, distort, or rotate the logo

## Color System

### Primary Palette

#### Neon Theme Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Neon Purple | hsl(var(--neon-purple)) | #A855F7 | Primary accent, interactive elements |
| Neon Blue | hsl(var(--neon-blue)) | #38BDF8 | Information, links, secondary actions |
| Neon Aqua | hsl(var(--neon-aqua)) | #00F7EF | Default accent, primary buttons |
| Neon Green | hsl(var(--neon-green)) | #B6FF5D | Success states, progress indicators |
| Neon Red | hsl(var(--neon-red)) | #F43F5E | Destructive actions, errors, alerts |
| Neon Yellow | hsl(var(--neon-yellow)) | #FBBF24 | Warnings, notifications, attention |

#### Core Neutral Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Background | hsl(var(--background)) | #FAFAFA | Page background |
| Foreground | hsl(var(--foreground)) | #262626 | Primary text |
| Card | hsl(var(--card)) | #FFFFFF | Card backgrounds |
| Card Foreground | hsl(var(--card-foreground)) | #262626 | Text on cards |
| Muted | hsl(var(--muted)) | #E5E5E5 | Subtle backgrounds |
| Muted Foreground | hsl(var(--muted-foreground)) | #737373 | Subtle text |
| Border | hsl(var(--border)) | #CCCCCC | Borders, dividers |
| Input | hsl(var(--input)) | #CCCCCC | Form control borders |
| Ring | hsl(var(--ring)) | #5EDECF | Focus rings |

### Functional Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Primary | hsl(var(--primary)) | #5EDECF | Primary buttons, key UI elements |
| Primary Foreground | hsl(var(--primary-foreground)) | #FFFFFF | Text on primary elements |
| Secondary | hsl(var(--secondary)) | #E8E4DC | Secondary buttons, backgrounds |
| Secondary Foreground | hsl(var(--secondary-foreground)) | #262626 | Text on secondary elements |
| Accent | hsl(var(--accent)) | #C1EDEA | Accent backgrounds, highlights |
| Accent Foreground | hsl(var(--accent-foreground)) | #264E46 | Text on accent backgrounds |
| Destructive | hsl(var(--destructive)) | #F56565 | Destructive actions, errors |
| Destructive Foreground | hsl(var(--destructive-foreground)) | #FFFFFF | Text on destructive elements |

### Alert Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Alert Red | hsl(var(--alert-red)) | #E05252 | Critical priority |
| Alert Orange | hsl(var(--alert-orange)) | #F97316 | High priority |
| Alert Yellow | hsl(var(--alert-yellow)) | #FBBF24 | Medium priority |
| Alert Blue | hsl(var(--alert-blue)) | #3B82F6 | Information |
| Alert Green | hsl(var(--alert-green)) | #10B981 | Success |

### Gradient Usage Guidelines
- Buttons use gradients running from full color to 80% opacity for depth
- Cards use subtle gradients from white to off-white for depth
- Glowing effects use radial gradients with neon colors at low opacity (10-30%)
- Text headings may use linear gradients for emphasis on key sections

Examples:
```css
/* Primary button gradient */
background-gradient: linear-gradient(to right, hsl(var(--neon-aqua)), hsl(var(--neon-aqua)/0.8));

/* Card subtle gradient */
background-gradient: linear-gradient(to bottom right, white, #f8f8f8);

/* Glowing border effect */
box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
```

## Typography

### Font Families
- **Primary Font**: SF Pro Display (system-ui fallback)
- **Monospace Font**: SF Mono (for code blocks, technical data)

### Font Sizes and Weights
| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| h1 | 24px (1.5rem) | 32px (2rem) | Bold (700) | Main page headings |
| h2 | 20px (1.25rem) | 28px (1.75rem) | Bold (700) | Section headings |
| h3 | 18px (1.125rem) | 26px (1.625rem) | Bold (700) | Subsection headings |
| h4 | 16px (1rem) | 24px (1.5rem) | Bold (700) | Card headings |
| Body | 16px (1rem) | 24px (1.5rem) | Regular (400) | Main body text |
| Body Small | 14px (0.875rem) | 20px (1.25rem) | Regular (400) | Secondary text |
| Caption | 12px (0.75rem) | 16px (1rem) | Medium (500) | Labels, captions |
| Code | 14px (0.875rem) | 20px (1.25rem) | Regular (400) | Code blocks |
| Button | 14px (0.875rem) | 20px (1.25rem) | Medium (500) | Button text |

### Typography Guidelines
- Use sentence case for all headings and UI elements
- Maintain a line length of 65-75 characters for optimal readability
- Use appropriate text truncation with ellipsis for overflowing text
- Apply proper hierarchy with font sizes, weights, and colors
- Use monospaced fonts only for code or technical information
- Apply letter spacing of 0.5px to small caps and all-caps text

## Iconography

### Icon System
- Primary icon set: Lucide React
- Icon sizes: 16px, 20px, 24px (default), 32px
- Stroke width: 1.5px for UI icons
- Icon color should match text color unless highlighting a specific state
- Icon-only buttons must include tooltips for accessibility

### Icon Usage Guidelines
- Maintain consistent padding (8px minimum) around icons
- Use icons sparingly to avoid visual clutter
- Pair icons with labels when introducing new features
- Use animation sparingly and with purpose (e.g., loading states)
- For primary navigation, use recognizable and conventional icons

## Spacing System

### Base Unit
- Base unit: 4px
- All spacing values should be multiples of the base unit

### Spacing Scale
| Name | Size | Usage |
|------|------|-------|
| px | 1px | Borders, hairlines |
| 0.5 | 2px | Minimal spacing |
| 1 | 4px | Tight spacing |
| 2 | 8px | Default compact spacing |
| 3 | 12px | Default spacing between related items |
| 4 | 16px | Standard spacing between elements |
| 5 | 20px | Medium spacing |
| 6 | 24px | Default spacing between sections |
| 8 | 32px | Large spacing |
| 10 | 40px | Extra-large spacing |
| 12 | 48px | Section padding |
| 16 | 64px | Page padding |

### Layout Guidelines
- Use consistent spacing within component types
- Increase spacing when separating different sections
- Maintain consistent alignment within sections
- Use grid systems for complex layouts
- Responsive spacing should scale proportionally

## Border Radius

### Radius Scale
| Name | Size | Usage |
|------|------|-------|
| none | 0px | No rounding |
| sm | 4px | Subtle rounding for small elements |
| DEFAULT | 6px | Standard component rounding |
| md | 8px | Medium rounding |
| lg | 12px | Large rounding for prominent elements |
| xl | 16px | Extra large rounding |
| full | 9999px | Fully rounded (circles, pills) |

### Radius Usage Guidelines
- Use consistent radius within related component groups
- Smaller components should use smaller radii
- Larger, more prominent components should use larger radii
- Apply radius consistently across the application

## Shadows and Elevation

### Shadow Scale
| Name | Properties | Usage |
|------|------------|-------|
| card | `0 4px 8px rgba(0, 0, 0, 0.05)` | Default card shadow |
| card-hover | `0 8px 16px rgba(0, 0, 0, 0.1)` | Elevated card state |
| button | `0 2px 4px rgba(0, 0, 0, 0.1)` | Button shadow |
| button-hover | `0 4px 8px rgba(0, 0, 0, 0.15)` | Elevated button state |
| alert | `0 2px 8px rgba(0, 0, 0, 0.15)` | Alert/notification shadow |
| neon-purple | `0 0 12px rgba(168, 85, 247, 0.5)` | Purple glow effect |
| neon-green | `0 0 12px rgba(182, 255, 93, 0.5)` | Green glow effect |
| neon-aqua | `0 0 12px rgba(0, 247, 239, 0.5)` | Aqua glow effect |
| neon-red | `0 0 12px rgba(244, 63, 94, 0.5)` | Red glow effect |
| neon-blue | `0 0 12px rgba(56, 189, 248, 0.5)` | Blue glow effect |
| neon-yellow | `0 0 12px rgba(251, 191, 36, 0.5)` | Yellow glow effect |

### Elevation Guidelines
- Use shadows to create a sense of depth and hierarchy
- Increase shadow size and blur for higher elevation
- Use neon shadows for interactive or highlighted elements
- Maintain consistent light direction (top-left light source)
- Combine shadows with subtle background color shifts for enhanced depth

## Component Library

### Buttons

#### Button Variants
- **Default**: Primary action, high emphasis
- **Secondary**: Alternative action, medium emphasis
- **Outline**: Secondary action with lower emphasis
- **Ghost**: Tertiary action, lowest emphasis
- **Link**: Navigational action, styled as link
- **Destructive**: Dangerous or irreversible actions
- **Success**: Positive or completion actions
- **Info**: Informational actions
- **Warning**: Cautionary actions
- **Gradient**: Special emphasis, key feature actions

#### Button Sizes
- **Small**: Compact UI areas, secondary actions
- **Default**: Standard size for most UI areas
- **Large**: Primary CTAs, prominent actions
- **Icon**: Icon-only buttons

#### Button States
- Default
- Hover
- Active/Pressed
- Focus
- Disabled
- Loading

### Cards

#### Card Variants
- **Default**: Standard content container
- **Interactive**: Clickable card with hover state
- **Expandable**: Card that can be expanded for more content
- **Alert**: Card for notifications and alerts
- **Stat**: Card for displaying key metrics
- **Action**: Card with prominent actions

#### Card Parts
- CardHeader: Contains title and optional description
- CardTitle: Primary heading for the card
- CardDescription: Supporting text for the card
- CardContent: Main content area
- CardFooter: Actions or secondary information

### Form Controls

#### Text Inputs
- Default styling with consistent padding and border radius
- Focus state with ring effect
- Error state with red border and error message
- Disabled state with reduced opacity
- Label positioning above inputs
- Helper text and error message placement below inputs

#### Selects & Dropdowns
- Custom styling to match text inputs
- Clear indication of interactive state
- Dropdown menu styling with consistent shadows and borders
- Selected state styling
- Multi-select variant with tags

#### Checkboxes & Radio Buttons
- Custom styling with neon accent colors
- Clear visual feedback for selected state
- Support for indeterminate state (checkboxes)
- Disabled state styling

#### Toggle/Switch
- Sliding animation for state changes
- Clear on/off visual differentiation
- Size variants (small, default, large)
- Optional labels

### Navigation

#### Header/Navigation Bar
- Fixed position at top of viewport
- Contains logo, primary navigation, and user actions
- Responsive behavior for different screen sizes
- Shadow to create separation from content

#### Tab Navigation
- Underline style for active tab
- Hover state for inactive tabs
- Optional icons for enhanced clarity
- Responsive behavior (scrolling or stacking)

#### Breadcrumbs
- Clear separation between levels
- Truncation for long text
- Current page indication
- Optional home icon

#### Sidebar
- Collapsible behavior
- Active state for current section
- Grouping of related items
- Icon and label combinations
- Responsive behavior for mobile screens

### Feedback & Dialogs

#### Alerts & Notifications
- Color coding by severity (error, warning, info, success)
- Icon reinforcement of message type
- Dismissable option
- Timeout for automatic dismissal
- Positioning in UI (toast, inline, etc.)

#### Modal Dialogs
- Backdrop overlay with blur effect
- Focus trap for keyboard accessibility
- Size variants (small, medium, large)
- Header, content, and footer sections
- Primary and secondary action buttons

#### Progress Indicators
- Progress bar with animation
- Loading spinner with neon effect
- Skeleton loading state
- Percentage or step indicators
- Completion state

### Data Visualization

#### Tables
- Consistent cell padding
- Alternating row colors for readability
- Sort indicators
- Selection states
- Responsive behavior for narrow viewports

#### Charts & Graphs
- Consistent color palette matching UI theme
- Clear labels and legends
- Interactive tooltips
- Loading and empty states
- Responsive sizing

#### Status Badges
- Color-coded by status
- Consistent size and padding
- Optional icons for enhanced clarity
- High contrast for readability

### Miscellaneous

#### Tooltips
- Consistent positioning and animation
- Max width for content
- Arrow pointing to reference element
- Delay before showing

#### Avatars
- Consistent border radius
- Size variants (small, medium, large)
- Fallback for missing images
- Status indicator position

#### Dividers
- Consistent color and weight
- Optional labels or icons
- Vertical and horizontal orientations
- Spacing guidelines

## Animation & Transitions

### Timing Functions
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` - Smooth, natural movement
- **In**: `cubic-bezier(0.4, 0, 1, 1)` - Quick acceleration
- **Out**: `cubic-bezier(0, 0, 0.2, 1)` - Gentle deceleration
- **Linear**: `linear` - Constant speed (use sparingly)

### Duration Guidelines
- **Fast**: 150ms - Micro-interactions, button clicks
- **Default**: 300ms - Most UI transitions
- **Slow**: 500ms - Complex or dramatic transitions

### Common Animations
- **Fade**: Opacity transitions for appearance/disappearance
- **Scale**: Size changes for emphasis
- **Slide**: Position changes for panels and drawers
- **Pulse**: Attention-grabbing pulsing effect
- **Progress**: Loading and progress indicators
- **Typing**: Text appearance animations
- **Cursor**: Blinking cursor effects

### Animation Usage Guidelines
- Use animations to provide feedback and guide attention
- Keep animations subtle and purposeful
- Ensure animations don't delay user interaction
- Respect user preferences for reduced motion
- Maintain consistent animation patterns throughout the UI

## Responsive Design

### Breakpoints
| Name | Size | Description |
|------|------|-------------|
| xs | < 640px | Extra small devices (phones) |
| sm | >= 640px | Small devices (large phones, portrait tablets) |
| md | >= 768px | Medium devices (landscape tablets) |
| lg | >= 1024px | Large devices (laptops) |
| xl | >= 1280px | Extra large devices (desktops) |
| 2xl | >= 1536px | Ultra large devices (large desktops) |

### Responsive Guidelines
- Use fluid layouts that adapt to different screen sizes
- Design mobile-first, then enhance for larger screens
- Use relative units (rem, em, %) instead of fixed pixels when possible
- Test designs across all breakpoints
- Consider touch targets for mobile (minimum 44×44px)
- Optimize content for each breakpoint (hide, collapse, reorder)

## Accessibility Guidelines

### Color Contrast
- Text should maintain a minimum contrast ratio of 4.5:1 against its background (3:1 for large text)
- UI controls should have a minimum contrast ratio of 3:1 against adjacent colors
- Do not rely on color alone to convey information

### Keyboard Navigation
- All interactive elements must be focusable
- Focus states must be clearly visible
- Logical tab order following visual layout
- Keyboard shortcuts for power users

### Screen Reader Support
- All images must have alt text
- Form elements must have associated labels
- ARIA roles and attributes for complex components
- Semantic HTML structure

### Reduced Motion
- Honor prefers-reduced-motion media query
- Provide alternatives to motion-based interactions
- Keep essential animations subtle

## Implementation Guidelines

### Tailwind CSS Usage
- Use utility classes for consistency
- Extract components for reusable patterns
- Use Tailwind theme configuration for scaling
- Follow naming conventions for custom utilities

### Component Structure
- Follow atomic design principles (atoms, molecules, organisms)
- Maintain clear component boundaries
- Use composition over inheritance
- Document component APIs

### CSS Variables
- Use CSS variables for themeable properties
- Follow naming conventions for variables
- Organize variables by purpose
- Document variable usage

### Documentation Format
- Include visual examples
- Provide code snippets
- Document props and variants
- Include accessibility considerations
- Note responsive behavior

## Brand Voice Guidelines

### Tone
- Professional but approachable
- Clear and concise
- Technical but not overly complex
- Empowering and confident

### Messaging Examples
- Error states: Focus on solutions, not blame
- Empty states: Guide users to next actions
- Success feedback: Confirm and suggest next steps
- Loading states: Set expectations for wait times

## Comprehensive Component Examples

### Command Cards
```jsx
<div className="command-card p-4">
  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center">
    <div className="w-2 h-2 rounded-full bg-neon-purple mr-2"></div>
    Card Title
  </h3>
  <p className="text-sm text-muted-foreground mb-4">
    Supporting description text goes here and explains the feature.
  </p>
  <div className="flex justify-end">
    <Button variant="default" size="sm">
      Take Action
    </Button>
  </div>
</div>
```

### Status Badge System
```jsx
<Badge variant="info">Active</Badge>
<Badge variant="success">Complete</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="secondary">Inactive</Badge>
```

### Alert Box
```jsx
<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message for the user.
  </AlertDescription>
</Alert>
```

### Progress Visualization
```jsx
<div className="relative pt-1">
  <div className="flex mb-2 items-center justify-between">
    <div>
      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-neon-green/20 text-neon-green">
        Task Progress
      </span>
    </div>
    <div className="text-right">
      <span className="text-xs font-semibold inline-block text-neon-green">
        70%
      </span>
    </div>
  </div>
  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-muted">
    <div style={{ width: '70%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-neon-green animate-progress"></div>
  </div>
</div>
```

## Future Extensibility

### Theme Management
- Light/dark mode support
- Color scheme variations
- Custom theme builder
- Theme switching tools

### Design Token Evolution
- Version control for design tokens
- Deprecation strategy
- Migration guides for major changes
- Testing framework for visual regression

### Component Extension
- Plugin architecture for components
- Component composition guidelines
- Override patterns for customization
- Framework-agnostic design tokens

## Versioning and Change Management

### Version Strategy
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Document breaking changes prominently
- Provide migration guides between versions
- Maintain a comprehensive changelog

### Review Process
- Design review checklist
- Implementation review checklist
- Accessibility review checklist
- Performance review checklist

## Conclusion

The action.it Design System provides a comprehensive foundation for building consistent, accessible, and visually appealing interfaces. By following these guidelines, development teams can ensure a cohesive user experience across the application while maintaining flexibility for future expansion and refinement.

This design system is a living document that will evolve with the product, incorporating feedback from users and adapting to new patterns and requirements as they emerge.
