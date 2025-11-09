# 🧬 CloneX DNA Icons

This folder contains the **official CloneX DNA icon set**, cleaned and standardized for use across the entire CloneX.wtf ecosystem.

All icons are lightweight, single-tone SVGs that inherit color dynamically from the active site theme — allowing them to adapt seamlessly between light, dark, and Murakami Finish modes.

---

## 📂 Folder Structure

```
clonex.wtf/
└── assets/
    └── dna-icons/
        ├── human.svg
        ├── robot.svg
        ├── demon.svg
        ├── angel.svg
        ├── reptile.svg
        ├── undead.svg
        ├── alien.svg
        ├── murakami.svg
        └── mkDrip.svg
```

---

## ✅ Icon Standards

| Property | Rule |
|-----------|------|
| **Class naming** | `.st0` only |
| **Fill/Stroke** | `fill: currentColor;` (and `stroke: currentColor` if applicable) |
| **ViewBox** | `0 0 25 25` |
| **Mask support** | `.st0` may include `mask: url(#mask)` if the original geometry requires it |
| **No gradients or textures** | All color comes from the active theme |
| **No embedded comments, defs, or Illustrator metadata** | Fully cleaned for production use |

---

## 🎨 Theming & Styling

Each icon inherits its color automatically via CSS using `currentColor`.

Example:
```css
.icon {
  width: 24px;
  height: 24px;
  color: var(--accent);
  transition: color 0.3s ease;
}

[data-theme="dark"] .icon {
  color: var(--accent-contrast);
}

/* Murakami Finish shimmer */
:root[data-finish="murakami"] .icon {
  background: var(--finish-gradient);
  -webkit-background-clip: text;
  color: transparent;
  animation: dripFoil var(--finish-speed) ease-in-out infinite;
}
```

---

## 🪩 Murakami Drip Icon

`mkDrip.svg` acts as a **visual marker** for any CloneX with the Murakami Drip trait or finish.
It uses the same `.st0 { fill: currentColor; }` structure and gains holographic shimmer automatically when `data-finish="murakami"` is active.

---

## 🧩 Usage in Next.js

#### Import directly
```tsx
import Image from "next/image";

<Image
  src="/assets/dna-icons/robot.svg"
  alt="Robot DNA Icon"
  className="icon"
/>
```

#### Or inline with SVGR
```tsx
import RobotIcon from "@/assets/dna-icons/robot.svg";

<RobotIcon className="icon" />
```

---

## ⚙️ Maintenance Notes

- Any new DNA icons added must follow the same `.st0 { fill: currentColor; }` structure.
- If Illustrator or Figma exports multiple classes (`.st1`, `.st2`, etc.), merge them down to `.st0`.
- Never embed static hex colors — color is theme-driven.
- Keep file size minimal (under ~3 KB each).

---

**Maintained by:**  
🧠 *CloneX.wtf Frontend Team*  
🌐 [https://clonex.wtf](https://clonex.wtf)

---
