# Frontend Styling Convention

## 1. Styling stack

- Theme tokens live in [`src/app/App.tsx`](./src/app/App.tsx) through Ant Design `ConfigProvider`.
- Cross-page CSS variables and a small set of global helpers live in [`src/App.css`](./src/App.css).
- Page and component styles should live beside the component as `*.module.scss`.

## 2. Preferred order of customization

1. Prefer Ant Design token or component token changes for shared visual rules.
2. Prefer `var(--eva-*)` CSS variables for cross-module colors, borders, spacing, and shadows.
3. Use local `module.scss` for component/page layout and one-off styling.
4. Use `:global(...)` only when targeting Ant Design generated selectors from inside a local module root.

## 3. Inline style rule

- Avoid `style={{ ... }}` for static layout, spacing, colors, borders, typography, or widths.
- Allow inline styles only when values are truly runtime-driven, such as chart widths, element coordinates, canvas sizing, or third-party APIs that require a style object.

## 4. File placement

- Keep styles colocated with the component: `Foo.tsx` + `Foo.module.scss`.
- Use camelCase class names such as `pageHeader`, `toolbarActions`, `emptyState`.
- Keep global CSS in `App.css` limited to reset rules, tokens, shared helpers, and top-level Ant Design overrides.

## 5. Token usage

- Prefer `var(--eva-primary)`, `var(--eva-text-secondary)`, `var(--eva-border)`, `var(--eva-bg-subtle)` over hard-coded hex values.
- When a new value will be reused across pages, promote it into `App.css` instead of duplicating it in multiple modules.

## 6. Ant Design guidance

- First ask whether a requirement can be solved with `ConfigProvider` tokens.
- If local overrides are still needed, scope them under a module root:

```scss
.panel {
  :global(.ant-card-body) {
    padding: 16px;
  }
}
```

- Do not add global `.ant-*` overrides unless the rule is intentionally app-wide.

## 7. Suggested page structure

- `page`
- `header`
- `toolbar`
- `actions`
- `content`
- `emptyState`
- `loadingState`

This keeps new pages aligned and makes it easier to move shared patterns into global helpers later.
