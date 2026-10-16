/**
 * User Alert and Status Management
 * Type-safe user feedback system following accessibility best practices
 */

import {createElement, getElement} from '../utils/dom.ts';
import type {StatusState} from '../types';

/**
 * Alert types for consistent styling and behavior
 */
type AlertType = 'error' | 'success' | 'warning' | 'info';

/**
 * Announcement priority levels for screen readers
 */
type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Alert configuration interface
 */
interface AlertConfig {
    readonly type: AlertType;
    readonly message: string;
    readonly duration?: number;
    readonly persistent?: boolean;
    readonly role?: 'alert' | 'status';
    readonly ariaLive?: AnnouncementPriority;
}

/**
 * Show error message with auto-removal and proper accessibility
 *
 * @param message - Error message to display
 * @param duration - Duration in milliseconds (default: 5000)
 */
export const showError = (message: string, duration: number = 5000): void => {
    console.error(message);

    showAlert({
        type: 'error',
        message,
        duration,
        role: 'alert',
        ariaLive: 'assertive'
    });
};

/**
 * Show success message with auto-removal
 * @param message - Success message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const showSuccess = (message: string, duration: number = 3000): void => {
    showAlert({
        type: 'success',
        message,
        duration,
        role: 'status',
        ariaLive: 'polite'
    });
};

/**
 * Generic alert display function with comprehensive configuration
 *
 * @param config - Alert configuration
 */
const showAlert = (config: AlertConfig): HTMLElement | null => {
    const alertContainer = getElement<HTMLElement>('alertContainer');
    if (!alertContainer) {
        console.warn('Alert container not found');
        return null;
    }

    const {
        type,
        message,
        duration = 5000,
        persistent = false,
        role = 'status',
        ariaLive = 'polite'
    } = config;

    // Create alert element with proper accessibility attributes
    const alert = createElement('div', {
        class: `alert alert-${type}`,
        role,
        'aria-live': ariaLive,
        'aria-atomic': 'true'
    }, [message]);

    alertContainer.appendChild(alert);

    // Auto-remove after specified duration (unless persistent)
    if (!persistent && duration > 0) {
        // Store timeout ID for potential cancellation
        (alert as any).__removalTimeout = window.setTimeout(() => {
            removeAlert(alert);
        }, duration);
    }

    return alert;
};

/**
 * Remove alert with animation
 * @param alert - Alert element to remove
 */
const removeAlert = (alert: HTMLElement): void => {
    if (!alert.parentNode) return;

    // Cancel any pending removal
    const timeoutId = (alert as any).__removalTimeout;
    if (timeoutId) {
        clearTimeout(timeoutId);
        delete (alert as any).__removalTimeout;
    }

    // Start fade-out animation using existing CSS class
    alert.classList.add('fade-out');

    // Remove element after animation completes
    // Store timeout for cleanup
    (alert as any).__animationTimeout = window.setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
};

/**
 * Update status text and indicator with caching and type safety
 *
 * @param message - Status message
 * @param state - Status state
 */
export const updateStatus = (message: string, state: StatusState = 'loading'): void => {
    const statusText = getElement<HTMLElement>('statusText');
    const statusDot = getElement<HTMLElement>('statusDot');

    if (statusText) {
        statusText.textContent = message;
        // Add aria-label for better accessibility
        statusText.setAttribute('aria-label', `Status: ${message}`);
    }

    if (statusDot) {
        statusDot.className = `status-dot ${state}`;
        // Update aria-label based on state
        const stateLabels: Record<StatusState, string> = {
            loading: 'Loading',
            ready: 'Ready',
            error: 'Error',
            processing: 'Processing'
        };
        statusDot.setAttribute('aria-label', stateLabels[state]);
    }
};

// Default export for compatibility
export default {
    showError,
    showSuccess,
    updateStatus
} as const;