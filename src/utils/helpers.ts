/**
 * General Helper Utilities
 * Type-safe utility functions
 */

import type { DebouncedFunction } from '../types';

/**
 * Debounce function to limit execution frequency with proper typing
 * Following Single Responsibility Principle - only handles debouncing
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cleanup
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): DebouncedFunction<T> & { cancel(): void } => {
    let timeoutId: number | undefined;

    const debouncedFn = (...args: Parameters<T>): void => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func.apply(null, args), delay);
    };

    debouncedFn.cancel = (): void => {
        clearTimeout(timeoutId);
        timeoutId = undefined;
    };

    return debouncedFn;
};

/**
 * Format file size in human-readable format with proper number handling
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return 'Invalid size';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);

    return `${parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(dm))} ${sizes[sizeIndex]}`;
};

// Default export for compatibility
export default {
    debounce,
    formatFileSize
} as const;