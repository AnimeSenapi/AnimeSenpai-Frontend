# Accessibility Guide for Developers

## Quick Reference

### 1. Use Accessible Components

#### Buttons
```tsx
import { AccessibleButton } from '@/components/ui/accessible-button'

<AccessibleButton
  variant="primary"
  size="md"
  loading={isLoading}
  ariaLabel="Submit form"
  leftIcon={<Save />}
>
  Save
</AccessibleButton>
```

#### Inputs
```tsx
import { AccessibleInput } from '@/components/ui/accessible-input'

<AccessibleInput
  label="Email"
  type="email"
  required
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<Mail />}
/>
```

### 2. Add ARIA Labels

```tsx
// Good: Clear label
<button aria-label="Close dialog">×</button>

// Bad: No label
<button>×</button>
```

### 3. Use Semantic HTML

```tsx
// Good: Semantic HTML
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// Bad: Div soup
<div>
  <div>
    <div>Home</div>
  </div>
</div>
```

### 4. Keyboard Navigation

```tsx
// Ensure all interactive elements are keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me
</button>
```

### 5. Focus Management

```tsx
import { FocusTrap } from '@/components/FocusTrap'

<FocusTrap active={isOpen}>
  <div role="dialog" aria-modal="true">
    {/* Modal content */}
  </div>
</FocusTrap>
```

### 6. Screen Reader Announcements

```tsx
import { announceToScreenReader } from '@/lib/accessibility'

const handleSuccess = () => {
  announceToScreenReader('Form submitted successfully', 'polite')
}
```

### 7. Color Contrast

```tsx
// Use predefined accessible colors
import { ACCESSIBLE_COLORS } from '@/lib/accessibility'

// Or check contrast
import { checkContrast } from '@/lib/accessibility'

const result = checkContrast('#000000', '#ffffff')
console.log(result.meetsAA) // true
```

### 8. Images

```tsx
// Decorative images
<img src="decorative.png" alt="" aria-hidden="true" />

// Informative images
<img src="profile.jpg" alt="User profile picture" />

// Complex images
<img src="chart.png" alt="" aria-describedby="chart-desc" />
<div id="chart-desc">Chart showing sales data...</div>
```

### 9. Forms

```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="email">
    Email
    {required && <span aria-label="required">*</span>}
  </label>
  <input
    id="email"
    type="email"
    required
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <div id="email-error" role="alert">
      {errors.email}
    </div>
  )}
</form>
```

### 10. Loading States

```tsx
<button aria-busy={isLoading} aria-disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

## Common Patterns

### Modal/Dialog
```tsx
import { FocusTrap } from '@/components/FocusTrap'

function Modal({ isOpen, onClose }) {
  return (
    <FocusTrap active={isOpen}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title">Modal Title</h2>
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
        {/* Modal content */}
      </div>
    </FocusTrap>
  )
}
```

### Dropdown Menu
```tsx
function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)

  return (
    <div>
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem">
            <a href="/profile">Profile</a>
          </li>
        </ul>
      )}
    </div>
  )
}
```

### Tabs
```tsx
function Tabs() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div role="tablist">
      <button
        role="tab"
        aria-selected={activeTab === 0}
        aria-controls="tabpanel-0"
        onClick={() => setActiveTab(0)}
      >
        Tab 1
      </button>
      <div
        role="tabpanel"
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        Content
      </div>
    </div>
  )
}
```

## Testing Checklist

Before committing code, check:

- [ ] All images have alt text
- [ ] All buttons have labels or aria-labels
- [ ] All inputs have associated labels
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Error messages are announced to screen readers
- [ ] Loading states are announced
- [ ] Modal/dialog focus is trapped
- [ ] Semantic HTML is used

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11Y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

