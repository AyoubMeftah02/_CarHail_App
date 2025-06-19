
# 📘 Tailwind UI + Headless UI Cheatsheet (2025)

> Tailwind is the primary styling framework for this project.

---

## 🧱 Layout Utilities

```html
<!-- Flexbox -->
<div class="flex justify-between items-center"></div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4"></div>

<!-- Container -->
<div class="container mx-auto px-4"></div>
```

---

## 🎨 Common Styles

```html
<!-- Typography -->
<h1 class="text-2xl font-bold text-gray-800">Heading</h1>
<p class="text-sm text-gray-500">Description</p>

<!-- Spacing & Sizing -->
<div class="p-4 m-2 w-full max-w-md h-64"></div>

<!-- Borders & Shadows -->
<div class="border rounded-xl shadow-lg"></div>
```

---

## 🧠 Headless UI Components

### 🪟 Dialog (Modal)

```tsx
import { Dialog } from '@headlessui/react'

<Dialog open={isOpen} onClose={() => setIsOpen(false)}>
  <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
  <div className="fixed inset-0 flex items-center justify-center">
    <Dialog.Panel className="bg-white p-6 rounded shadow-md">
      <Dialog.Title>My Dialog</Dialog.Title>
      <p>Modal content here.</p>
    </Dialog.Panel>
  </div>
</Dialog>
```

---

### 📋 Menu (Dropdown)

```tsx
import { Menu } from '@headlessui/react'

<Menu>
  <Menu.Button className="px-4 py-2 bg-blue-500 text-white">Options</Menu.Button>
  <Menu.Items className="mt-2 p-2 bg-white shadow rounded">
    <Menu.Item>
      {({ active }) => (
        <button className={`${active ? 'bg-blue-100' : ''} block w-full`}>Item 1</button>
      )}
    </Menu.Item>
    <Menu.Item>
      {({ active }) => (
        <button className={`${active ? 'bg-blue-100' : ''} block w-full`}>Item 2</button>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>
```

---

### ✅ Listbox (Custom Select)

```tsx
import { Listbox } from '@headlessui/react'

<Listbox value={selected} onChange={setSelected}>
  <Listbox.Button className="border px-4 py-2">{selected.name}</Listbox.Button>
  <Listbox.Options>
    {options.map((option) => (
      <Listbox.Option
        key={option.id}
        value={option}
        className={({ active }) =>
          `${active ? 'bg-blue-100' : ''} px-4 py-2`
        }
      >
        {option.name}
      </Listbox.Option>
    ))}
  </Listbox.Options>
</Listbox>
```

---

### 🔁 Switch (Toggle)

```tsx
import { Switch } from '@headlessui/react'

<Switch
  checked={enabled}
  onChange={setEnabled}
  className={`${enabled ? 'bg-blue-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 rounded-full`}
>
  <span className="sr-only">Enable</span>
  <span
    className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform bg-white rounded-full`}
  />
</Switch>
```

---

## 💡 Tips

- Use `@apply` in CSS files for reusable utility classes.
- Combine with `framer-motion` for animation.
- Headless UI gives you accessibility + behavior, you style it with Tailwind.
- Tailwind UI (paid) offers fully styled prebuilt components.
