/**
 * Navigation and Tab Management
 * Type-safe navigation system following accessibility standards
 */

import { getElement, getElements, querySelector, querySelectorAll } from '../utils/dom.ts';
import type { InputViewType, TabSection } from '../types';

/**
 * Navigation state management interface
 */
interface NavigationState {
    currentView?: InputViewType;
    activeResumeTab?: 'text' | 'pdf';
    activeJobTab?: 'text' | 'pdf';
    expandedFAQs: Set<string>;
    modelDetailsExpanded: boolean;
}

/**
 * Global navigation state
 */
const navigationState: NavigationState = {
    expandedFAQs: new Set(),
    modelDetailsExpanded: false
};

/**
 * Tab configuration interface
 */
interface TabConfig {
    readonly section: TabSection;
    readonly type: 'text' | 'pdf';
    readonly containerId: string;
    readonly contentId: string;
}

/**
 * Switch between main input views (Resume/Job Description)
 * @param viewId - The view ID to switch to
 * @param tabElement - The tab element that was clicked
 */
export const switchInputView = (viewId: string, tabElement?: HTMLElement): void => {
    try {
        // Validate input
        if (!isValidInputView(viewId)) {
            console.warn(`Invalid view ID: ${viewId}`);
            return;
        }

        // Cache DOM elements for better performance
        const contentAreas = querySelectorAll<HTMLElement>('.input-content-area');
        const mainTabs = querySelectorAll<HTMLElement>('.main-input-tab');
        const targetArea = getElement<HTMLElement>(viewId);
        const tabsContainer = querySelector<HTMLElement>('.input-panel-tabs');

        // Hide all input content areas
        contentAreas.forEach(area => {
            area.classList.add('hidden');
            area.setAttribute('aria-hidden', 'true');
        });

        // Show the selected content area
        if (targetArea) {
            targetArea.classList.remove('hidden');
            targetArea.setAttribute('aria-hidden', 'false');
        }

        // Update tab states with proper ARIA attributes
        mainTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        if (tabElement) {
            tabElement.classList.add('active');
            tabElement.setAttribute('aria-selected', 'true');
            tabElement.setAttribute('tabindex', '0');
            tabElement.focus();
        }

        // Update the visual indicator
        if (tabsContainer) {
            tabsContainer.setAttribute('data-active', viewId);
        }

        // Update navigation state
        navigationState.currentView = viewId as InputViewType;

        // Announce navigation change to screen readers
        const viewNames: Record<string, string> = {
            'resume-view': 'Resume input',
            'job-view': 'Job description input',
            'samples-view': 'Sample content'
        };

        const viewName = viewNames[viewId] || viewId;
        announceViewChange(viewName);

    } catch (error) {
        console.error('Error switching input view:', error);
    }
};

/**
 * Switch between input types (Text/PDF) within a section
 * @param section - The section ('resume' or 'job')
 * @param type - The type ('text' or 'pdf')
 */
export const switchTab = (section: TabSection, type: 'text' | 'pdf'): void => {
    try {
        // Validate inputs
        if (!isValidTabSection(section) || !isValidTabType(type)) {
            console.warn(`Invalid tab parameters: section=${section}, type=${type}`);
            return;
        }

        const config: TabConfig = {
            section,
            type,
            containerId: `${section}-view`,
            contentId: `${section}-${type}`
        };

        // Cache section container
        const sectionContainer = getElement<HTMLElement>(config.containerId);
        if (!sectionContainer) {
            console.warn(`Section container not found: ${config.containerId}`);
            return;
        }

        // Hide all tab contents for this section
        const tabContents = sectionContainer.querySelectorAll<HTMLElement>('.tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
            content.setAttribute('aria-hidden', 'true');
        });

        // Show the selected tab content
        const targetContent = getElement<HTMLElement>(config.contentId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.setAttribute('aria-hidden', 'false');
        }

        // Update tab button states
        const inputTabs = sectionContainer.querySelectorAll<HTMLElement>('.input-tab');
        inputTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        const activeTab = sectionContainer.querySelector<HTMLElement>(
            `[data-section="${section}"][data-type="${type}"]`
        );
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
            activeTab.setAttribute('tabindex', '0');
        }

        // Update visual indicator
        const tabsContainer = sectionContainer.querySelector<HTMLElement>('.input-tabs');
        if (tabsContainer) {
            tabsContainer.setAttribute('data-active', type);
        }

        // Update navigation state
        if (section === 'resume') {
            navigationState.activeResumeTab = type;
        } else {
            navigationState.activeJobTab = type;
        }

        // Announce tab change
        announceTabChange(section, type);

    } catch (error) {
        console.error('Error switching tab:', error);
    }
};

export const toggleMobileMenu = (): void => {
    const menuBtn = getElement<HTMLButtonElement>('mobileMenuBtn');
    const mobileNav = getElement<HTMLElement>('mobileNav');

    if (menuBtn && mobileNav) {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!isExpanded));
        mobileNav.classList.toggle('show');
    }
};

/**
 * Toggle FAQ item expansion with optimized DOM operations and state tracking
 * @param button - The FAQ question button
 */
export const toggleFAQ = (button: HTMLElement): void => {
    try {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const answerId = button.getAttribute('aria-controls');
        const faqId = button.id || answerId || `faq-${Date.now()}`;

        if (!answerId) {
            console.warn('FAQ button missing aria-controls attribute');
            return;
        }

        const answer = getElement<HTMLElement>(answerId);
        const icon = button.querySelector<HTMLElement>('.faq-icon');
        const parentElement = button.parentElement;

        if (!answer) {
            console.warn(`FAQ answer element not found: ${answerId}`);
            return;
        }

        const newState = !isExpanded;

        // Update attributes directly
        button.setAttribute('aria-expanded', newState.toString());
        answer.setAttribute('aria-hidden', (!newState).toString());

        // Update visual state
        if (parentElement) {
            parentElement.classList.toggle('active', newState);
        }

        // Update icon if present
        if (icon) {
            icon.textContent = newState ? '−' : '+';
            icon.setAttribute('aria-label', newState ? 'Collapse' : 'Expand');
        }

        // Update navigation state
        if (newState) {
            navigationState.expandedFAQs.add(faqId);
        } else {
            navigationState.expandedFAQs.delete(faqId);
        }

        // Announce state change to screen readers
        const questionText = button.textContent?.trim() || 'FAQ item';
        const stateText = newState ? 'expanded' : 'collapsed';
        announceStateChange(`${questionText} ${stateText}`);

    } catch (error) {
        console.error('Error toggling FAQ:', error);
    }
};

/**
 * Toggle model details visibility with enhanced accessibility
 */
export const toggleModelDetails = (): void => {
    try {
        const elements = getElements<HTMLElement>(['modelToggleCompact', 'modelSpecsCompact']);
        const { modelToggleCompact: button, modelSpecsCompact: specs } = elements;

        if (!button || !specs) {
            console.warn('Model details elements not found');
            return;
        }

        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;

        // Update ARIA attributes
        button.setAttribute('aria-expanded', newState.toString());
        specs.setAttribute('aria-hidden', isExpanded.toString());

        // Toggle the expanded class with smooth animation support
        if (newState) {
            specs.classList.add('expanding');
            specs.classList.add('expanded');
            // Remove expanding class after animation
            setTimeout(() => specs.classList.remove('expanding'), 300);
        } else {
            specs.classList.add('collapsing');
            specs.classList.remove('expanded');
            // Remove collapsing class after animation
            setTimeout(() => specs.classList.remove('collapsing'), 300);
        }

        // Update button icon and label
        const icon = button.querySelector<HTMLElement>('span[aria-hidden="true"]');
        if (icon) {
            icon.textContent = newState ? '×' : 'ⓘ';
        }

        // Update button title and aria-label
        const actionText = newState ? 'Hide' : 'Show';
        button.setAttribute('title', `${actionText} model details`);
        button.setAttribute('aria-label', `${actionText} model details`);

        // Update navigation state
        navigationState.modelDetailsExpanded = newState;

        // Announce state change
        announceStateChange(`Model details ${newState ? 'shown' : 'hidden'}`);

    } catch (error) {
        console.error('Error toggling model details:', error);
    }
};

/**
 * Setup keyboard navigation for tabs
 */
export const setupKeyboardNavigation = (): void => {
    // Add keyboard event listeners for tab navigation
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;

        // Handle arrow key navigation for tabs
        if (target.classList.contains('main-input-tab') || target.classList.contains('input-tab')) {
            handleTabKeyNavigation(e, target);
        }

        // Handle Enter/Space for FAQ toggles
        if (target.classList.contains('faq-question')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(target);
            }
        }
    });
};

/**
 * Validate input view ID
 */
const isValidInputView = (viewId: string): viewId is string => {
    const validViews = ['resume-view', 'job-view', 'samples-view'];
    return validViews.includes(viewId);
};

/**
 * Validate tab section
 */
const isValidTabSection = (section: string): section is TabSection => {
    return section === 'resume' || section === 'job';
};

/**
 * Validate tab type
 */
const isValidTabType = (type: string): type is 'text' | 'pdf' => {
    return type === 'text' || type === 'pdf';
};

/**
 * Announce view change to screen readers
 */
const announceViewChange = (viewName: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${viewName}`;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
};

/**
 * Announce tab change to screen readers
 */
const announceTabChange = (section: TabSection, type: 'text' | 'pdf'): void => {
    const sectionName = section === 'resume' ? 'Resume' : 'Job Description';
    const typeName = type === 'text' ? 'text input' : 'PDF upload';
    announceViewChange(`${sectionName} ${typeName}`);
};

/**
 * Announce state change to screen readers
 */
const announceStateChange = (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
};

/**
 * Handle keyboard navigation for tabs
 */
const handleTabKeyNavigation = (e: KeyboardEvent, currentTab: HTMLElement): void => {
    const tabContainer = currentTab.closest('.input-panel-tabs, .input-tabs');
    if (!tabContainer) return;

    const allTabs = Array.from(tabContainer.querySelectorAll<HTMLElement>('[role="tab"]'));
    const currentIndex = allTabs.indexOf(currentTab);

    let nextIndex: number;

    switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            nextIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            e.preventDefault();
            nextIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            nextIndex = allTabs.length - 1;
            break;
        default:
            return;
    }

    const nextTab = allTabs[nextIndex];
    if (nextTab) {
        nextTab.focus();
        nextTab.click();
    }
};

// Default export for compatibility
export default {
    switchInputView,
    switchTab,
    toggleFAQ,
    toggleModelDetails,
    setupKeyboardNavigation
} as const;