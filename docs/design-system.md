
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
| Neon Purple | hsl(265, 90%, 65%) | #A855F7 | Primary accent, interactive elements |
| Neon Blue | hsl(199, 98%, 48%) | #38BDF8 | Information, links, secondary actions |
| Neon Aqua | hsl(181, 100%, 50%) | #00F7EF | Default accent, primary buttons |
| Neon Green | hsl(142, 100%, 68%) | #B6FF5D | Success states, progress indicators |
| Neon Red | hsl(346, 84%, 61%) | #F43F5E | Destructive actions, errors, alerts |
| Neon Yellow | hsl(41, 100%, 70%) | #FBBF24 | Warnings, notifications, attention |

#### Core Background Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Background | hsl(212, 35%, 15%) | #1C2A3A | Page background |
| Card | hsl(213, 33%, 18%) | #25384D | Card backgrounds |
| Border | hsl(213, 28%, 29%) | #3A4D62 | Border color |
| Foreground | hsl(213, 31%, 91%) | #F1F5F9 | Primary text |
| Muted Foreground | hsl(214, 32%, 91%) | #CBD5E1 | Secondary text |

### Functional Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Primary | hsl(181, 100%, 50%) | #00F7EF | Primary buttons, key UI elements |
| Primary Foreground | hsl(222, 47%, 11%) | #111827 | Text on primary elements |
| Secondary | hsl(265, 90%, 65%) | #A855F7 | Secondary buttons, backgrounds |
| Secondary Foreground | hsl(213, 31%, 91%) | #F1F5F9 | Text on secondary elements |
| Accent | hsl(142, 100%, 68%) | #B6FF5D | Accent backgrounds, highlights |
| Accent Foreground | hsl(222, 47%, 11%) | #111827 | Text on accent backgrounds |
| Destructive | hsl(346, 84%, 61%) | #F43F5E | Destructive actions, errors |
| Destructive Foreground | hsl(213, 31%, 91%) | #F1F5F9 | Text on destructive elements |

### Alert Colors
| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Alert Red | hsl(346, 84%, 61%) | #F43F5E | Critical priority |
| Alert Orange | hsl(25, 95%, 65%) | #F97316 | High priority |
| Alert Yellow | hsl(41, 100%, 70%) | #FBBF24 | Medium priority |
| Alert Blue | hsl(199, 98%, 48%) | #38BDF8 | Information |
| Alert Green | hsl(142, 70%, 45%) | #10B981 | Success |

### Gradient Usage Guidelines
- Buttons use gradients running from full color to 80% opacity for depth
- Cards use subtle dark gradients for depth
- Glowing effects use radial gradients with neon colors at low opacity (10-30%)
- Text headings may use linear gradients for emphasis on key sections

Examples:
```css
/* Primary button gradient */
background: linear-gradient(to right, hsl(var(--neon-aqua)), hsl(var(--neon-aqua)/0.8));

/* Card subtle gradient */
background: linear-gradient(to bottom right, #25384D, #1C2A3A);

/* Glowing border effect */
box-shadow: 0 0 15px rgba(0, 247, 239, 0.3);
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
- **Default**: Primary action with neon aqua to green gradient
- **Secondary**: Alternative action with purple gradient
- **Outline**: Secondary action with border and transparent background
- **Ghost**: Tertiary action with no background or border
- **Link**: Navigational action, styled as link
- **Destructive**: Dangerous actions with red gradient
- **Success**: Positive actions with green gradient
- **Info**: Informational actions with blue gradient
- **Warning**: Cautionary actions with yellow gradient
- **Gradient**: Special emphasis with multi-color gradient

Example implementation:
```jsx
<Button variant="default">Default Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button variant="success">Success Button</Button>
<Button variant="info">Info Button</Button>
<Button variant="warning">Warning Button</Button>
<Button variant="gradient">Gradient Button</Button>
```

#### Button Sizes
- **Small**: Compact UI areas, secondary actions
- **Default**: Standard size for most UI areas
- **Large**: Primary CTAs, prominent actions
- **Icon**: Icon-only buttons

Example implementation:
```jsx
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon"><PlusIcon /></Button>
```

#### Button States
- Default
- Hover (with brightness increase and shadow glow)
- Active/Pressed
- Focus (with ring effect)
- Disabled (reduced opacity)
- Loading

### Cards

#### Card Variants
- **Default**: Standard dark-themed content container with border
- **Interactive**: Clickable card with hover state
- **Alert**: Card for notifications and alerts
- **Stat**: Card for displaying key metrics

#### Card Parts
- CardHeader: Contains title and optional description
- CardTitle: Primary heading with gradient text
- CardDescription: Supporting text in muted color
- CardContent: Main content area
- CardFooter: Actions or secondary information with top border

Example implementation:
```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content of the card</p>
  </CardContent>
  <CardFooter>
    <Button>Action Button</Button>
  </CardFooter>
</Card>
```

### Form Controls

#### Text Inputs
- Dark backgrounds with border
- Focus state with neon ring effect
- Error state with red border and error message
- Disabled state with reduced opacity
- Label positioning above inputs
- Helper text and error message placement below inputs

Example implementation:
```jsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
  <p className="text-sm text-muted-foreground">We'll never share your email.</p>
</div>
```

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

#### Sidebar
- Collapsible behavior with animation
- Active state for current section
- Grouping of related items
- Icon and label combinations
- Dark background with border separation

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

### Feedback & Dialogs

#### Alerts & Notifications
- Color coding by severity with left border accent
- Icon reinforcement of message type
- Dismissable option
- Timeout for automatic dismissal
- Dark themed with neon accents

Example implementation:
```jsx
<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>This is a warning message.</AlertDescription>
</Alert>
```

#### Modal Dialogs
- Backdrop overlay with blur effect
- Focus trap for keyboard accessibility
- Size variants (small, medium, large)
- Header, content, and footer sections
- Primary and secondary action buttons
- Dark themed with consistent border radius

#### Progress Indicators
- Progress bar with neon gradients
- Loading spinner with glow effect
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

#### Status Badges
- Gradient backgrounds with neon colors
- Consistent size and padding
- Border accents
- High contrast for readability

### Miscellaneous

#### Tooltips
- Consistent positioning and animation
- Max width for content
- Arrow pointing to reference element
- Delay before showing
- Dark background with high contrast text

#### Avatars
- Consistent border radius
- Size variants (small, medium, large)
- Fallback for missing images
- Status indicator position

#### Dividers
- Consistent color and weight
- Optional labels or icons
- Vertical and horizontal orientations

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

## Feature Components

### Mindboard System
- **Mindboards**: Collection of related mind sections and pages
- **MindSections**: Logical groupings within a mindboard
- **MindPages**: Individual documents within sections
- **MindBlocks**: Content blocks within pages (text, code, images, audio, video, etc.)

The MindBlock system supports various content types:
- Text blocks
- Todo items with completion tracking
- Headings (levels 1-3)
- File attachments
- Code blocks with syntax highlighting
- Images with captions
- Audio playback
- Video playback
- Embedded content
- And more specialized blocks

Example MindBlock renderer:
```jsx
<Card className="w-full mb-4 overflow-hidden">
  {block.content_type === 'text' && (
    <div className="p-4">
      <p>{block.content.text}</p>
    </div>
  )}
  {block.content_type === 'todo' && (
    <div className="p-4 flex items-center gap-2">
      <Checkbox
        checked={block.content.completed}
        onCheckedChange={handleTodoToggle}
      />
      <span className={block.content.completed ? 'line-through text-muted-foreground' : ''}>
        {block.content.text}
      </span>
    </div>
  )}
  {/* Additional block types... */}
</Card>
```

### Command Cards
```jsx
<Card className="card-container">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description text</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Take Action</Button>
  </CardFooter>
</Card>
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
      <Badge variant="success">Task Progress</Badge>
    </div>
    <div className="text-right">
      <span className="text-xs font-semibold text-neon-green">70%</span>
    </div>
  </div>
  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-muted">
    <div style={{ width: '70%' }} className="shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-neon-green"></div>
  </div>
</div>
```

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
