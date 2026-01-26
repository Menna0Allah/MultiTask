# MultiTask Design System

## Color Palette

### Primary Colors
- Primary: `blue-600` (#2563eb)
- Secondary: `purple-600` (#9333ea)
- Accent: `pink-600` (#db2777)

### Gradients
```
Standard Gradient: from-purple-600 to-pink-600
Hero Gradient: from-indigo-900 via-purple-900 to-pink-800
Success Gradient: from-green-500 to-emerald-500
Info Gradient: from-blue-500 to-cyan-500
Warning Gradient: from-yellow-500 to-orange-500
```

## Spacing Scale

**Always use these values for consistency:**

```css
0   - 0px
1   - 0.25rem (4px)
2   - 0.5rem (8px)
3   - 0.75rem (12px)
4   - 1rem (16px)
5   - 1.25rem (20px)
6   - 1.5rem (24px)
8   - 2rem (32px)
10  - 2.5rem (40px)
12  - 3rem (48px)
16  - 4rem (64px)
20  - 5rem (80px)
24  - 6rem (96px)
```

### Padding Standards

**Cards:**
- Small cards: `p-4` (16px)
- Medium cards: `p-6` (24px)
- Large cards: `p-8` (32px)

**Containers:**
- Section padding (vertical): `py-12` or `py-16`
- Container padding (horizontal): `px-4 sm:px-6 lg:px-8`

**Buttons:**
- Small: `px-4 py-2`
- Medium: `px-6 py-3`
- Large: `px-8 py-4`

### Margin Standards

**Between sections:** `mb-8` or `mb-12`
**Between elements in a card:** `mb-4` or `mb-6`
**Between list items:** `space-y-4` or `gap-4`

### Gap Standards

**Grids:**
- Tight: `gap-4`
- Normal: `gap-6`
- Loose: `gap-8`

**Flexbox:**
- Tight: `gap-2` or `gap-3`
- Normal: `gap-4`
- Loose: `gap-6`

## Typography

### Font Sizes
```css
text-xs    - 0.75rem (12px)
text-sm    - 0.875rem (14px)
text-base  - 1rem (16px)
text-lg    - 1.125rem (18px)
text-xl    - 1.25rem (20px)
text-2xl   - 1.5rem (24px)
text-3xl   - 1.875rem (30px)
text-4xl   - 2.25rem (36px)
text-5xl   - 3rem (48px)
```

### Font Weights
- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)
- Extra Bold: `font-extrabold` (800)

### Line Heights
- Tight: `leading-tight`
- Normal: `leading-normal`
- Relaxed: `leading-relaxed`

## Borders

### Border Widths
- Default: `border` (1px)
- Thick: `border-2` (2px)
- Extra Thick: `border-4` (4px)

### Border Radius
```css
rounded-sm  - 0.125rem (2px)   [Rarely used]
rounded     - 0.25rem (4px)    [Rarely used]
rounded-md  - 0.375rem (6px)   [Rarely used]
rounded-lg  - 0.5rem (8px)     [Standard for small elements]
rounded-xl  - 0.75rem (12px)   [Standard for cards]
rounded-2xl - 1rem (16px)      [Standard for modals/large cards]
rounded-full- 9999px           [Circles, pills]
```

**Usage:**
- Buttons: `rounded-lg` or `rounded-xl`
- Cards: `rounded-xl` or `rounded-2xl`
- Modals: `rounded-2xl`
- Badges: `rounded-full` or `rounded-lg`
- Inputs: `rounded-lg`

### Border Colors
- Light mode: `border-gray-200` or `border-gray-300`
- Dark mode: `dark:border-gray-700` or `dark:border-gray-600`

## Shadows

**Only use these 4 shadow levels:**

```css
shadow-sm  - Small shadow for subtle elevation
shadow-md  - Medium shadow for cards at rest
shadow-lg  - Large shadow for cards/modals
shadow-xl  - Extra large shadow for hover states
shadow-2xl - Maximum shadow for important elevated elements
```

**Usage:**
- Buttons: `shadow-md` normal, `shadow-lg` on hover
- Cards: `shadow-lg` normal, `shadow-xl` on hover
- Modals: `shadow-2xl`
- Dropdowns: `shadow-xl`

## Components

### Buttons
```jsx
// Primary
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
           hover:from-purple-700 hover:to-pink-700 text-white
           font-semibold rounded-lg shadow-md hover:shadow-lg
           transform hover:-translate-y-0.5 transition-all duration-300"

// Secondary
className="px-6 py-3 bg-gray-100 dark:bg-gray-700
           text-gray-900 dark:text-white font-semibold
           rounded-lg shadow-md hover:shadow-lg
           transition-all duration-300"

// Outline
className="px-6 py-3 border-2 border-purple-600
           text-purple-600 dark:text-purple-400
           font-semibold rounded-lg hover:bg-purple-50
           dark:hover:bg-purple-900/20 transition-all duration-300"
```

### Cards
```jsx
className="bg-white dark:bg-gray-800 rounded-xl p-6
           shadow-lg hover:shadow-xl transition-all duration-300
           border border-gray-200 dark:border-gray-700"
```

### Inputs
```jsx
className="w-full px-4 py-3 bg-white dark:bg-gray-800
           border border-gray-300 dark:border-gray-700
           rounded-lg text-gray-900 dark:text-white
           placeholder-gray-400 focus:ring-2
           focus:ring-purple-500 focus:border-transparent
           transition-all"
```

### Badges
```jsx
className="inline-flex items-center px-3 py-1
           rounded-full text-xs font-semibold
           bg-purple-100 text-purple-800
           dark:bg-purple-900/30 dark:text-purple-400"
```

## Responsive Breakpoints

```css
sm: 640px   - Tablet
md: 768px   - Small laptop
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Extra large
```

**Usage Pattern:**
```jsx
// Mobile first
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
className="px-4 sm:px-6 lg:px-8"
className="py-8 sm:py-12 lg:py-16"
```

## Animations

### Transitions
```css
transition-all duration-200  - Fast (buttons, hover states)
transition-all duration-300  - Standard (most transitions)
transition-all duration-500  - Slow (modals, major changes)
```

### Transforms
```css
hover:-translate-y-0.5  - Subtle lift on hover
hover:scale-105         - Slight scale on hover
hover:scale-110         - Medium scale on hover
```

### Common Animation Classes
```css
animate-pulse     - Pulsing animation
animate-bounce    - Bouncing animation
animate-spin      - Spinning animation
animate-fade-in   - Custom fade in (defined in index.css)
```

## Dark Mode

**Pattern for all elements:**
```jsx
className="bg-white dark:bg-gray-800
           text-gray-900 dark:text-white
           border-gray-200 dark:border-gray-700"
```

### Background Colors
- White bg: `bg-white dark:bg-gray-800`
- Light bg: `bg-gray-50 dark:bg-gray-900`
- Slightly darker: `bg-gray-100 dark:bg-gray-700`

### Text Colors
- Primary text: `text-gray-900 dark:text-white`
- Secondary text: `text-gray-600 dark:text-gray-400`
- Muted text: `text-gray-500 dark:text-gray-500`

## Common Patterns

### Page Container
```jsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div className="container-custom max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    {/* Content */}
  </div>
</div>
```

### Section Spacing
```jsx
<section className="py-12 sm:py-16 lg:py-20">
  <div className="container-custom px-4 sm:px-6 lg:px-8">
    {/* Section content */}
  </div>
</section>
```

### Grid Layouts
```jsx
// 3 column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4 column responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

## Best Practices

1. **Be Consistent**: Always use the defined spacing values
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Dark Mode**: Always include dark mode classes
4. **Transitions**: Add transitions to interactive elements
5. **Accessibility**: Include focus states and ARIA labels
6. **Performance**: Use transforms for animations, not position changes

## Anti-Patterns (Avoid)

❌ `p-5`, `p-7`, `gap-5` (use p-4 or p-6, gap-4 or gap-6)
❌ `shadow` alone (use shadow-sm, shadow-md, shadow-lg, shadow-xl, or shadow-2xl)
❌ Mixing `margin` and `padding` inconsistently
❌ Using arbitrary values like `p-[15px]`
❌ Forgetting dark mode variants
❌ Inconsistent border-radius (stick to rounded-lg, rounded-xl, rounded-2xl, rounded-full)
