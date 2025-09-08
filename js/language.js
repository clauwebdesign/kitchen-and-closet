class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.init();
    }

    detectLanguage() {
        // Method 1: Check URL hash for language (e.g., #lang=es)
        const hash = window.location.hash;
        const hashMatch = hash.match(/[#&]lang=([a-z]{2})/);
        if (hashMatch && ['en', 'es'].includes(hashMatch[1])) {
            return hashMatch[1];
        }

        // Method 2: Check URL search params (e.g., ?lang=es)
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam && ['en', 'es'].includes(langParam)) {
            return langParam;
        }

        // Method 3: Check localStorage for saved preference
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && ['en', 'es'].includes(savedLang)) {
            return savedLang;
        }

        // Method 4: Check URL path for language code (for future server support)
        const path = window.location.pathname;
        const pathSegments = path.split('/').filter(segment => segment);
        
        if (pathSegments.length > 0) {
            const langCode = pathSegments[0];
            if (['en', 'es'].includes(langCode)) {
                return langCode;
            }
        }
        
        // Method 5: Fallback to browser language
        const browserLang = navigator.language.split('-')[0];
        return ['en', 'es'].includes(browserLang) ? browserLang : 'en';
    }

    async init() {
        await this.loadTranslations();
        this.updatePageLanguage();
        this.updateContent();
    }

    async loadTranslations() {
        try {
            const response = await fetch(`languages/${this.currentLanguage}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English
            if (this.currentLanguage !== 'en') {
                this.currentLanguage = 'en';
                const response = await fetch('languages/en.json');
                this.translations = await response.json();
            }
        }
    }

    updatePageLanguage() {
        document.documentElement.lang = this.currentLanguage;
    }

    updateContent() {
        // Update language selectors
        this.updateLanguageSelectors();
        
        // Auto-translate elements with data attributes
        this.autoTranslateElements();
    }

    updateLanguageSelectors() {
        // Update desktop language selector
        const desktopSelector = document.getElementById('language-select');
        if (desktopSelector) {
            desktopSelector.value = this.currentLanguage;
        }

        // Update mobile language selector
        const mobileSelector = document.getElementById('mobile-language-select');
        if (mobileSelector) {
            mobileSelector.value = this.currentLanguage;
        }
    }

    async switchLanguage(langCode) {
        if (langCode === this.currentLanguage) return;
        
        this.currentLanguage = langCode;
        await this.loadTranslations();
        this.updatePageLanguage();
        this.updateContent();
        this.updateLanguageSelectors();
        
        // Save preference to localStorage
        localStorage.setItem('preferred-language', langCode);
        
        // Update URL with language parameter (works with static file servers)
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        
        // Update URL without page reload
        window.history.pushState({}, '', url.toString());
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getTranslations() {
        return this.translations;
    }

    /**
     * Get translated text by key path (e.g., 'main.banner.title')
     * @param {string} key - The dot-separated key path
     * @param {string} fallback - Optional fallback text if key not found
     * @returns {string} The translated text or fallback
     */
    text(key, fallback = '') {
        if (!key || typeof key !== 'string') {
            return fallback;
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }

        return typeof value === 'string' ? value : (fallback || key);
    }

    /**
     * Get translated text with interpolation support
     * @param {string} key - The dot-separated key path
     * @param {object} variables - Variables to interpolate
     * @param {string} fallback - Optional fallback text if key not found
     * @returns {string} The translated text with interpolated variables
     */
    textWithVars(key, variables = {}, fallback = '') {
        let text = this.text(key, fallback);
        
        // Simple variable interpolation: {{variableName}}
        Object.keys(variables).forEach(varName => {
            const regex = new RegExp(`{{${varName}}}`, 'g');
            text = text.replace(regex, variables[varName]);
        });

        return text;
    }

    /**
     * Auto-translate elements with data-translate attributes
     */
    autoTranslateElements() {
        console.log('Auto-translating elements...');
        
        // Method 1: Data attributes
        const elementsWithDataTranslate = document.querySelectorAll('[data-translate]');
        elementsWithDataTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            const fallback = element.getAttribute('data-translate-fallback') || '';
            const text = this.text(key, fallback);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = text;
            } else if (element.hasAttribute('data-translate-html')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        });

        // Method 2: Template syntax in HTML content
        const elementsWithTemplates = document.querySelectorAll('[data-translate-template]');
        elementsWithTemplates.forEach(element => {
            const template = element.getAttribute('data-translate-template');
            const variables = this.parseTemplateVariables(element);
            const text = this.textWithVars(template, variables);
            
            if (element.hasAttribute('data-translate-html')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        });

        // Method 3: Inline translation markers {{key}}
        this.translateInlineMarkers();
    }

    /**
     * Parse template variables from data attributes
     */
    parseTemplateVariables(element) {
        const variables = {};
        const dataAttrs = element.attributes;
        
        for (let i = 0; i < dataAttrs.length; i++) {
            const attr = dataAttrs[i];
            if (attr.name.startsWith('data-var-')) {
                const varName = attr.name.replace('data-var-', '');
                variables[varName] = attr.value;
            }
        }
        
        return variables;
    }

    /**
     * Translate inline markers like {{main.banner.title}}
     */
    translateInlineMarkers() {
        const elementsToTranslate = document.querySelectorAll('[data-translate-inline]');
        
        elementsToTranslate.forEach(element => {
            // Get the original content from data attribute or restore from a stored version
            let originalContent = element.getAttribute('data-original-content');
            
            // If no stored original content, store the current content as original
            if (!originalContent) {
                originalContent = element.innerHTML;
                element.setAttribute('data-original-content', originalContent);
            }
            
            // Check if original content has translation markers
            const hasMarkers = originalContent.includes('{{') && originalContent.includes('}}');
            
            if (hasMarkers) {
                // Use a fresh regex for replacement
                const markerRegex = /\{\{([^}]+)\}\}/g;
                let translatedContent = originalContent.replace(markerRegex, (match, key) => {
                    const translation = this.text(key, match); // Use original if not found
                    return translation;
                });
                
                element.innerHTML = translatedContent;
            }
        });
    }

    /**
     * Translate a specific element by selector
     * @param {string} selector - CSS selector for the element
     * @param {string} key - Translation key
     * @param {string} fallback - Fallback text
     * @param {boolean} useHTML - Whether to use innerHTML instead of textContent
     */
    translateElement(selector, key, fallback = '', useHTML = false) {
        const element = document.querySelector(selector);
        if (element) {
            const text = this.text(key, fallback);
            if (useHTML) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    }

    /**
     * Translate multiple elements at once
     * @param {Array} elements - Array of {selector, key, fallback, useHTML} objects
     */
    translateElements(elements) {
        elements.forEach(({selector, key, fallback = '', useHTML = false}) => {
            this.translateElement(selector, key, fallback, useHTML);
        });
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
});

// Language switcher function
function switchLanguage(langCode) {
    if (window.languageManager) {
        window.languageManager.switchLanguage(langCode);
    }
}