/**
 * DOM Utility Functions
 * Optimized DOM manipulation utilities with caching and strict typing
 *
 */

import type { ElementResult, ElementsResult, CharacterCount } from '../types';

// DOM element cache for better performance with type safety
const elementCache = new Map<string, HTMLElement>();

/**
 * Get DOM element with caching and type safety
 * Following Single Responsibility Principle - only retrieves and caches elements
 * @param id - Element ID
 * @returns Cached DOM element or null if not found
 */
export const getElement = <T extends HTMLElement = HTMLElement>(id: string): ElementResult<T> => {
    if (elementCache.has(id)) {
        const element = elementCache.get(id) as T;
        if (document.contains(element)) {
            return element;
        }
        // Element no longer in DOM, remove from cache
        elementCache.delete(id);
    }

    const element = document.getElementById(id) as T | null;
    if (element) {
        elementCache.set(id, element);
    }
    return element;
};

/**
 * Get multiple DOM elements with caching and type safety
 * @param ids - Array of element IDs
 * @returns Object with cached DOM elements
 */
export const getElements = <T extends HTMLElement = HTMLElement>(ids: readonly string[]): ElementsResult<T> => {
    const elements: ElementsResult<T> = {};
    ids.forEach(id => {
        elements[id] = getElement<T>(id);
    });
    return elements;
};

/**
 * Calculate character count information for a textarea
 * @param textarea - The textarea element
 * @returns Character count information
 */
export const getCharacterCount = (textarea: HTMLTextAreaElement): CharacterCount => {
    const maxLength = parseInt(textarea.getAttribute('maxlength') || '10000', 10);
    const currentLength = textarea.value.length;

    return {
        current: currentLength,
        max: maxLength,
        remaining: maxLength - currentLength,
        isOverLimit: currentLength > maxLength
    };
};

/**
 * Update character counter for textarea with performance optimization
 * Following Single Responsibility Principle - only handles counter updates
 * @param textarea - The textarea element
 */
export const updateCharCounter = (textarea: HTMLTextAreaElement | null): void => {
    if (!textarea) return;

    const charCount = getCharacterCount(textarea);
    const counterId = textarea.id === 'resume' ? 'resumeCounter' : 'jobDescriptionCounter';
    const counter = getElement<HTMLElement>(counterId);

    if (counter) {
        counter.textContent = `${charCount.current}/${charCount.max}`;

        // Add visual feedback for character limits
        const percentage = (charCount.current / charCount.max) * 100;

        // Remove all existing color classes first
        counter.style.color = '';
        counter.style.fontWeight = '';

        if (percentage > 90) {
            counter.style.color = '#f44336';
            counter.style.fontWeight = '600';
        } else if (percentage > 75) {
            counter.style.color = '#ff9800';
            counter.style.fontWeight = '500';
        } else {
            counter.style.color = '#999';
            counter.style.fontWeight = 'normal';
        }
    }
};

/**
 * Safe DOM query selector with type safety
 * @param selector - CSS selector
 * @param parent - Parent element to query within
 * @returns Selected element or null
 */
export const querySelector = <T extends HTMLElement = HTMLElement>(
    selector: string,
    parent: Document | HTMLElement = document
): T | null => {
    return parent.querySelector<T>(selector);
};

/**
 * Safe DOM query selector all with type safety
 * @param selector - CSS selector
 * @param parent - Parent element to query within
 * @returns NodeList of selected elements
 */
export const querySelectorAll = <T extends HTMLElement = HTMLElement>(
    selector: string,
    parent: Document | HTMLElement = document
): NodeListOf<T> => {
    return parent.querySelectorAll<T>(selector);
};


/**
 * Create element with type safety and attributes
 * @param tagName - HTML tag name
 * @param attributes - Element attributes
 * @param children - Child elements or text
 * @returns Created element
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, string>,
    children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tagName);

    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    if (children) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
    }

    return element;
};

// Default export for compatibility
export default {
    getElement,
    getElements,
    getCharacterCount,
    updateCharCounter,
    querySelector,
    querySelectorAll,
    createElement
} as const;