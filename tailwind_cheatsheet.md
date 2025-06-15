# Tailwind CSS Cheatsheet

## 🧱 Layout & Box Model

| Prefix / Class | Description |
|---|---|
| `w-` | Width (e.g., `w-full`, `w-1/2`, `w-96`) |
| `h-` | Height (e.g., `h-screen`, `h-64`) |
| `m-` | Margin (e.g., `m-4`, `mx-2`, `mt-8`) |
| `p-` | Padding (e.g., `p-6`, `px-4`, `py-2`) |
| `space-x-`, `space-y-` | Spacing between children |
| `box-border`, `box-content` | Box sizing |

## 🧭 Flexbox & Grid

| Prefix / Class | Description |
|---|---|
| `flex` | Enable flex layout (`flex`, `flex-col`, etc.) |
| `items-` | Align items vertically (`items-center`) |
| `justify-` | Align items horizontally (`justify-between`) |
| `gap-` | Gap between flex/grid items (`gap-4`) |
| `grid` | Enable grid layout (`grid-cols-2`, etc.) |
| `col-span-`, `row-span-` | Grid item span |

## 🧍‍♂️ Positioning

| Prefix / Class | Description |
|---|---|
| `relative`, `absolute`, `fixed`, `sticky` | Positioning |
| `top-`, `bottom-`, `left-`, `right-` | Offset values |
| `z-` | Z-index (`z-10`, `z-50`) |
| `inset-` | All sides (`inset-0`, `inset-y-4`) |

## 🅰️ Typography

| Prefix / Class | Description |
|---|---|
| `text-` | Text size/color/alignment (`text-lg`, `text-red-500`) |
| `font-` | Font weight or family (`font-bold`, `font-sans`) |
| `leading-` | Line height (`leading-tight`) |
| `tracking-` | Letter spacing (`tracking-wide`) |
| `truncate`, `line-clamp-` | Text overflow & clamping |

## 🎨 Colors & Effects

| Prefix / Class | Description |
|---|---|
| `bg-` | Background color (`bg-blue-500`) |
| `text-` | Text color (`text-gray-700`) |
| `border-` | Border size/color (`border`, `border-red-300`) |
| `rounded-` | Border radius (`rounded`, `rounded-lg`) |
| `shadow-` | Box shadow (`shadow-md`, `shadow-lg`) |
| `opacity-` | Transparency (`opacity-50`) |
| `ring-` | Focus ring (`ring`, `ring-offset-2`) |

## 🔄 State Modifiers

| Prefix | Description |
|---|---|
| `hover:` | On hover (e.g., `hover:bg-blue-600`) |
| `focus:` | On focus (`focus:outline-none`) |
| `active:` | On active state (`active:scale-95`) |
| `disabled:` | Disabled state (`disabled:opacity-50`) |
| `group-hover:` | Hover parent effect (`group-hover:bg-red-100`) |

## 🌐 Responsive Design

| Prefix | Description |
|---|---|
| `sm:` | ≥ 640px (small screens and up) |
| `md:` | ≥ 768px (medium screens and up) |
| `lg:` | ≥ 1024px (large screens and up) |
| `xl:` | ≥ 1280px (extra large) |
| `2xl:` | ≥ 1536px |

**Example:** `md:flex`, `lg:text-3xl`, `sm:hover:bg-blue-600`

## 🎯 Other Essentials

| Prefix / Class | Description |
|---|---|
| `transition`, `duration-`, `ease-` | Animations |
| `cursor-` | Mouse cursor (`cursor-pointer`) |
| `overflow-` | Scroll behavior (`overflow-x-auto`) |
| `hidden`, `block`, `inline-block` | Display settings |
| `max-w-`, `min-h-` | Min/max dimensions |
| `aspect-` | Aspect ratio (`aspect-video`) |

---

## Quick Examples

### Button Component
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>
```

### Responsive Card
```jsx
<div className="w-full md:w-1/2 lg:w-1/3 p-4">
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-semibold mb-2">Card Title</h3>
    <p className="text-gray-600">Card content goes here...</p>
  </div>
</div>
```

### Flex Layout
```jsx
<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
  <div className="flex-1">Content 1</div>
  <div className="flex-1">Content 2</div>
</div>
```

---

*Generated for Vite + React projects*