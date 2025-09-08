# Multi-Language Support

This website now supports multiple languages with URL-based language detection and JSON translation files.

## Features

- **URL-based language detection**: Languages are specified in the URL path (e.g., `/en/` or `/es/`)
- **JSON translation files**: Easy to maintain and update translations
- **Automatic language detection**: Falls back to browser language if no URL language is specified
- **Language switcher**: Available in both desktop and mobile navigation
- **Real-time language switching**: No page reload required
- **Custom text system**: Key-based translations like `window.languageManager.text('main.banner.title')`
- **Variable interpolation**: Support for dynamic content with `{{variable}}` syntax
- **Fallback support**: Graceful handling of missing translation keys

## Supported Languages

- English (en) - Default
- Spanish (es)

## File Structure

```
languages/
├── en.json          # English translations
└── es.json          # Spanish translations

js/
└── language.js      # Language management script
```

## How to Use

### 1. URL Structure
- English: `yoursite.com/en/` or `yoursite.com/` (default)
- Spanish: `yoursite.com/es/`

### 2. Adding New Languages

1. Create a new JSON file in the `languages/` directory (e.g., `fr.json` for French)
2. Copy the structure from `en.json` and translate the values
3. Update the language selector in `index.html` to include the new language option
4. Update the `detectLanguage()` method in `language.js` to include the new language code

### 3. Adding New Translatable Content

1. Add the new text to all language JSON files
2. Update the HTML to use the translation system
3. Add the translation logic to the appropriate method in `language.js`

### 4. Custom Text Usage

#### Basic Usage
```javascript
// Get translated text by key
const title = window.languageManager.text('main.banner.title');
// Returns: "Loft Interior Design" (EN) or "Diseño de Interiores Loft" (ES)

// With fallback text
const subtitle = window.languageManager.text('main.banner.subtitle', 'Default subtitle');

// Update DOM elements
document.getElementById('hero-title').textContent = window.languageManager.text('main.banner.title');
```

#### Variable Interpolation
```javascript
// Text with variables: "Welcome {{name}}! You have {{count}} messages."
const message = window.languageManager.textWithVars('main.welcome', {
    name: 'John',
    count: 5
});
// Returns: "Welcome John! You have 5 messages."
```

#### Available Methods
- `window.languageManager.text(key, fallback)` - Get translated text
- `window.languageManager.textWithVars(key, variables, fallback)` - Get text with variable interpolation
- `window.languageManager.getCurrentLanguage()` - Get current language code
- `window.languageManager.getTranslations()` - Get all translations object

### 5. Translation File Structure

```json
{
  "header": {
    "nav": {
      "home": "Home",
      "about": "About Us",
      "process": "Process",
      "services": "Services",
      "portfolio": "Portfolio",
      "testimonial": "Testimonial",
      "contact": "Contact"
    }
  },
  "footer": {
    "description": "We provides a full range of interior design, architectural design.",
    "contact": "Contact",
    "social_media": "Social Media",
    "address": "Address",
    "copyright": "Copyright © 2024"
  },
  "main": {
    "banner": {
      "title": "Loft Interior Design",
      "subtitle": "Transform your space with our expert design services"
    },
    "button": {
      "title": "Get Started",
      "learn_more": "Learn More",
      "contact_us": "Contact Us"
    },
    "about": {
      "title": "About Our Services",
      "description": "We specialize in creating beautiful, functional spaces that reflect your personal style."
    },
    "services": {
      "title": "Our Services",
      "interior_design": "Interior Design",
      "architecture": "Architecture",
      "consultation": "Consultation"
    }
  }
}
```

## Testing

Use the `test-lang.html` file to test the multi-language functionality:

1. Open `test-lang.html` in your browser
2. Use the language selector to switch between languages
3. Verify that all text updates correctly

## Browser Support

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Gracefully falls back to English if language files fail to load

## Customization

### Styling the Language Selector

The language selector can be styled by modifying the inline styles in the HTML or by adding CSS rules:

```css
.language-selector select {
    background: transparent;
    border: 1px solid #fff;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
}
```

### Adding More Translation Keys

To add more translatable content:

1. Add the key-value pairs to all language JSON files
2. Update the corresponding method in `language.js` to use the new translations
3. Ensure the HTML elements have the correct selectors for the JavaScript to find them