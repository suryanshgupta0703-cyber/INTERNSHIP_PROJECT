/**
 * Transformers.js Configuration and Initialization
 * This module handles the loading and setup of the HuggingFace transformers library
 * Following industry best practices for TypeScript, error handling, and module design
 *
 * Supports dynamic model loading:
 * - Local development: Models from public/models directory
 * - Production: Models from Cloudflare R2 or remote CDN
 */

import { getModelConfig } from './config/model-config';

/**
 * Type definitions for the transformers library using minimal typing approach
 * This avoids conflicts with the library's internal type definitions
 */

/**
 * Minimal transformers environment interface that we can safely modify
 * We only define the properties we actually use to avoid type conflicts
 */
interface ConfigurableEnvironment {
    allowLocalModels: boolean;
    allowRemoteModels: boolean;
    localModelPath: string;
    backends?: {
        onnx?: {
            wasm?: {
                numThreads?: number;
                [key: string]: unknown;
            };
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

/**
 * Pipeline factory function type - kept minimal for compatibility
 */
type PipelineFactory = (...args: unknown[]) => Promise<unknown>;

/**
 * Complete transformers library interface with minimal typing
 */
interface TransformersLibrary {
    readonly pipeline: PipelineFactory;
    readonly env: ConfigurableEnvironment;
}

/**
 * Event detail for transformers ready event
 */
interface TransformersReadyEventDetail {
    readonly status: 'ready';
    readonly timestamp: number;
    readonly version: string;
}

/**
 * Event detail for transformers error event
 */
interface TransformersErrorEventDetail {
    readonly error: string;
    readonly timestamp: number;
}

/**
 * Global window interface extension
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        transformers: TransformersLibrary | null;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        'transformersReady': CustomEvent<TransformersReadyEventDetail>;
        'transformersError': CustomEvent<TransformersErrorEventDetail>;
    }
}

/**
 * Configuration constants for transformers library
 */
const TRANSFORMERS_CONFIG = {
    LOCAL_MODEL_PATH: './',
    WASM_THREADS: 1,
    VERSION: 'local'
} as const;

/**
 * Updates UI elements to reflect transformers loading status
 * @param isError - Whether this is an error state update
 */
const updateTransformersUI = (isError: boolean): void => {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    if (statusText) {
        statusText.textContent = isError
            ? '❌ AI library failed to load'
            : 'AI library loaded';
    }

    if (statusDot) {
        statusDot.className = isError ? 'status-dot error' : 'status-dot ready';
    }
};

/**
 * Configures the transformers environment with privacy-first settings
 * Uses type-safe approach with minimal assumptions about internal structure
 * @param env - The transformers environment object from the library
 */
const configureTransformersEnvironment = (env: ConfigurableEnvironment): void => {
    // Environment is already configured in initializeTransformers
    // This function now just handles ONNX backend configuration

    // Configure ONNX backend for better browser compatibility
    // Safe configuration approach that works with any backend structure
    if (env.backends?.onnx?.wasm && typeof env.backends.onnx.wasm === 'object') {
        const wasmConfig = env.backends.onnx.wasm;
        // Only set numThreads if it exists or can be set
        try {
            wasmConfig.numThreads = TRANSFORMERS_CONFIG.WASM_THREADS;
        } catch (error) {
            // Silent fail if the property cannot be set (e.g., readonly)
            console.debug('Could not configure WASM threads:', error);
        }
    }
};

/**
 * Dispatches a custom event to notify about transformers initialization status
 * @param eventType - The type of event to dispatch
 * @param detail - The event detail object
 */
const dispatchTransformersEvent = <T>(
    eventType: 'transformersReady' | 'transformersError',
    detail: T
): void => {
    try {
        window.dispatchEvent(new CustomEvent(eventType, { detail }));
    } catch (error) {
        console.error(`Failed to dispatch ${eventType} event:`, error);
    }
};

/**
 * Handles transformers initialization errors with proper logging and UI updates
 * @param error - The error that occurred during initialization
 */
const handleTransformersError = (error: unknown): void => {
    // Safely set transformers to null
    window.transformers = null;

    // Update UI to reflect error state
    updateTransformersUI(true);

    // Log detailed error information
    console.error('Failed to load transformers:', error);

    // Dispatch error event for error handling in main application
    const errorDetail: TransformersErrorEventDetail = {
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
    };

    dispatchTransformersEvent('transformersError', errorDetail);
};

/**
 * Handles successful transformers initialization
 * @param pipeline - The pipeline factory function from transformers library
 * @param env - The environment configuration from transformers library
 */
const handleTransformersSuccess = (
    pipeline: PipelineFactory,
    env: ConfigurableEnvironment
): void => {
    // Configure transformers environment
    configureTransformersEnvironment(env);

    // Update UI to reflect success state
    updateTransformersUI(false);

    // Expose to global scope for legacy compatibility
    // Using Object.freeze for immutability
    window.transformers = Object.freeze({
        pipeline,
        env
    }) satisfies TransformersLibrary;

    console.log('✅ @huggingface/transformers loaded successfully');

    // Dispatch success event for application coordination
    const successDetail: TransformersReadyEventDetail = {
        status: 'ready',
        timestamp: Date.now(),
        version: TRANSFORMERS_CONFIG.VERSION
    };

    dispatchTransformersEvent('transformersReady', successDetail);
};

/**
 * Initialize transformers library with proper configuration
 * Following industry best practices for async initialization and error handling
 * Supports dynamic model loading based on environment (local/production)
 */
const initializeTransformers = async (): Promise<void> => {
    try {
        // Get dynamic model configuration based on environment
        const modelConfig = getModelConfig();

        // Set environment variables before import (industry standard 2025)
        if (typeof globalThis !== 'undefined') {
            (globalThis as any).HF_HUB_URL = modelConfig.remoteHost || 'https://huggingface.co';
            // ENABLE caching to prevent multiple downloads
            (globalThis as any).TRANSFORMERS_CACHE = true;
        }

        // Import transformers and configure for dynamic model loading
        const transformersModule = await import('@huggingface/transformers');
        const { pipeline, env } = transformersModule;

        // Force configuration immediately (critical for v3+)
        const envConfig: any = {
            allowLocalModels: modelConfig.allowLocalModels,
            allowRemoteModels: modelConfig.allowRemoteModels,
            localModelPath: modelConfig.allowLocalModels ? './' : '',
            remoteHost: modelConfig.remoteHost,
            remotePathTemplate: modelConfig.remotePathTemplate,
            // ENABLE caching to prevent multiple downloads
            useCache: true,
            cacheDir: './.cache'
        };

        Object.assign(env, envConfig);

        // Also set on the module itself if available
        if (transformersModule.env) {
            Object.assign(transformersModule.env, {
                allowLocalModels: modelConfig.allowLocalModels,
                allowRemoteModels: modelConfig.allowRemoteModels,
                remoteHost: modelConfig.remoteHost
            });
        }

        console.log(`✅ Transformers.js configured for ${modelConfig.source} models:`, {
            source: modelConfig.source,
            allowLocalModels: env.allowLocalModels,
            allowRemoteModels: env.allowRemoteModels,
            remoteHost: env.remoteHost,
            remotePathTemplate: env.remotePathTemplate,
            semanticModel: modelConfig.paths.semanticModel,
            domainModel: modelConfig.paths.domainModel
        });

        // Handle successful initialization
        handleTransformersSuccess(
            pipeline as PipelineFactory,
            env as unknown as ConfigurableEnvironment
        );

    } catch (error) {
        // Handle initialization failure gracefully
        handleTransformersError(error);
    }
};

// Initialize transformers when module loads
void initializeTransformers();

// Export to make this a module for global augmentation
export {};