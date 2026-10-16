/**
 * Device Detection and Mobile Optimization Utilities
 * Type-safe device detection
 */

import type { MobileStatusState } from '../types';

/**
 * Mobile device detection with comprehensive checks
 * Following Single Responsibility Principle - only detects mobile devices
 * @returns True if mobile device
 */
export const isMobileDevice = (): boolean => {
    const mobileBreakpoint = 768;
    const mobileUserAgentPattern = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    return window.innerWidth <= mobileBreakpoint ||
           mobileUserAgentPattern.test(navigator.userAgent);
};

/**
 * Tablet device detection
 * @returns True if tablet device
 */
const isTabletDevice = (): boolean => {
    const tabletBreakpoint = 1024;
    const tabletUserAgentPattern = /iPad|Android(?!.*Mobile)/i;

    return (window.innerWidth > 768 && window.innerWidth <= tabletBreakpoint) ||
           tabletUserAgentPattern.test(navigator.userAgent);
};

/**
 * Touch device detection with proper capability checking
 * @returns True if touch device
 */
const isTouchDevice = (): boolean => {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           // @ts-ignore - Legacy support for IE
           navigator.msMaxTouchPoints > 0;
};

/**
 * Initialize mobile optimizations safely
 * Following Dependency Inversion Principle - abstracts DOM manipulation
 */
export const initializeMobileOptimizations = (): void => {
    // Add viewport meta tag if not present (should be in HTML)
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
    }

    // Prevent zoom on double tap for better mobile experience
    if (isTouchDevice()) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event: TouchEvent) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    // Add mobile-specific CSS class
    if (isMobileDevice()) {
        document.documentElement.classList.add('mobile-device');
    }

    if (isTabletDevice()) {
        document.documentElement.classList.add('tablet-device');
    }
};

/**
 * Mobile Status Toast Manager
 * Following Single Responsibility Principle - only manages mobile status display
 */
export class MobileStatus {
    private toast: HTMLElement | null = null;
    private message: HTMLElement | null = null;
    private _isVisible: boolean = false;
    private hideTimeout: number | null = null;

    /**
     * Get current visibility state
     */
    public get isVisible(): boolean {
        return this._isVisible;
    }

    /**
     * Get current state as immutable object
     */
    public get state(): MobileStatusState {
        return {
            isVisible: this._isVisible,
            message: this.message?.textContent || ''
        };
    }

    /**
     * Initialize the mobile status system
     * Following Dependency Inversion Principle - depends on DOM abstractions
     */
    public init(): void {
        this.toast = document.getElementById('mobileStatusToast');
        this.message = document.getElementById('mobileStatusMessage');

        if (!this.toast || !this.message) {
            console.warn('Mobile status elements not found in DOM');
        }
    }

    /**
     * Show mobile status with animation
     * @param text - Status message to display
     */
    public show(text: string = 'Loading AI Model...'): void {
        if (!this.toast || !this.message) {
            console.warn('Mobile status not initialized');
            return;
        }

        // Only show on mobile devices
        if (!isMobileDevice()) {
            return;
        }

        // Clear any pending hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.message.textContent = text;
        this.toast.style.display = 'block';

        // Force reflow and show with animation
        requestAnimationFrame(() => {
            if (this.toast) {
                this.toast.classList.add('show');
                this._isVisible = true;
            }
        });
    }

    /**
     * Hide mobile status with animation
     */
    public hide(): void {
        if (!this.toast || !this._isVisible) {
            return;
        }

        this.toast.classList.remove('show');

        // Hide after animation completes
        this.hideTimeout = window.setTimeout(() => {
            if (this.toast) {
                this.toast.style.display = 'none';
                this._isVisible = false;
                this.hideTimeout = null;
            }
        }, 300);
    }

    /**
     * Update status message without hiding
     * @param text - New status message
     */
    public update(text: string): void {
        if (!this.message || !this._isVisible || !isMobileDevice()) {
            return;
        }

        this.message.textContent = text;
    }

    /**
     * Auto-hide status after specified duration
     * @param text - Status message
     * @param duration - Duration in milliseconds
     */
    public showTemporary(text: string, duration: number = 3000): void {
        this.show(text);

        setTimeout(() => {
            this.hide();
        }, duration);
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.hide();
        this.toast = null;
        this.message = null;
        this._isVisible = false;
    }
}

// Default export for compatibility
export default {
    isMobileDevice,
    initializeMobileOptimizations,
    MobileStatus
} as const;