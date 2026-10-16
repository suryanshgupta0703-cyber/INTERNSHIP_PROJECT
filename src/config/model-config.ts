/**
 * Dynamic Model Configuration
 * Supports both local development and production (Cloudflare R2) model loading
 */

/** Model file paths configuration */
export interface ModelPaths {
    semanticModel: string;
    domainModel: string;
    baseUrl: string;
    onnxBasePath: string;
    weightsPath: string;
}

/** Complete model configuration including source and paths */
export interface ModelConfig {
    source: 'local' | 'remote';
    allowLocalModels: boolean;
    allowRemoteModels: boolean;
    remoteHost: string;
    remotePathTemplate: string;
    paths: ModelPaths;
}

/**
 * Get model configuration based on environment variables
 * @returns Model configuration for current environment
 */
export function getModelConfig(): ModelConfig {
    const isProduction = import.meta.env.PROD;

    // Force remote mode in production for Cloudflare Pages
    // Even if env vars aren't set, this ensures correct behavior
    const modelSource = isProduction ? 'remote' : (import.meta.env.VITE_MODEL_SOURCE || 'local');

    const isLocal = modelSource === 'local';

    // Production fetches models through the same-origin Worker proxy so the
    // browser never hits huggingface.co (CORS + service worker interception).
    const remoteHost = isLocal ? '' : getRemoteHost();
    const remotePathTemplate = isLocal ? '' : 'models-proxy/{model}/resolve/main/';

    // Base configuration with hardcoded fallbacks for production
    const config: ModelConfig = {
        source: modelSource as 'local' | 'remote',
        allowLocalModels: isLocal,
        allowRemoteModels: !isLocal,
        // For remote (R2 with HF structure): Use base URL and standard HF path template
        // For local: Empty strings
        remoteHost,
        remotePathTemplate,
        paths: getPaths(isLocal)
    };

    console.log('[ModelConfig] Configuration:', {
        source: config.source,
        allowLocalModels: config.allowLocalModels,
        allowRemoteModels: config.allowRemoteModels,
        remoteHost: config.remoteHost,
        remotePathTemplate: config.remotePathTemplate,
        semanticModel: config.paths.semanticModel,
        isProduction,
        envSource: import.meta.env.VITE_MODEL_SOURCE
    });

    return config;
}

/**
 * Get model paths based on environment
 */
function getPaths(_isLocal: boolean): ModelPaths {
    const isProduction = import.meta.env.PROD;

    // Use Xenova models optimized for browser AI
    // These are specifically designed for Transformers.js and work without CORS issues
    // In production (Cloudflare Pages), force Xenova models to avoid CORS issues
    let semanticModelName: string;
    let domainModelName: string;

    if (isProduction) {
        // Hardcode Xenova models for production to ensure they work on Cloudflare
        semanticModelName = 'Xenova/all-MiniLM-L6-v2';
        domainModelName = 'Xenova/all-MiniLM-L6-v2';
    } else {
        // In development, use env vars or fallback to Xenova
        semanticModelName = import.meta.env.VITE_SEMANTIC_MODEL_PATH || 'Xenova/all-MiniLM-L6-v2';
        domainModelName = import.meta.env.VITE_DOMAIN_MODEL_PATH || 'Xenova/all-MiniLM-L6-v2';
    }

    const baseUrl = isProduction ? `${getRemoteHost()}/models-proxy` : (import.meta.env.VITE_MODEL_BASE_URL || 'https://huggingface.co');

    console.log('[ModelConfig] Model paths:', {
        semanticModelName,
        domainModelName,
        baseUrl,
        isProduction
    });

    // The onnxBasePath and weightsPath are used for custom ONNX models
    // For standard HF models, transformers.js handles these automatically
    return {
        semanticModel: semanticModelName,
        domainModel: domainModelName,
        baseUrl,
        onnxBasePath: `${baseUrl}/${semanticModelName}/resolve/main/onnx/`,
        weightsPath: `${baseUrl}/${semanticModelName}/resolve/main/universal_score_weights.json`
    };
}

/**
 * Get model URL for transformers.js pipeline
 * @param modelType - Type of model ('semantic' or 'domain')
 * @returns Full URL path to the model
 */
export function getModelUrl(modelType: 'semantic' | 'domain'): string {
    const config = getModelConfig();
    return modelType === 'semantic' ? config.paths.semanticModel : config.paths.domainModel;
}

/**
 * Get ONNX ensemble model URLs
 * @returns Object containing URLs for all ONNX ensemble models
 */
export function getOnnxModelUrls(): {
    polyFeatures: string;
    scoreMapper: string;
    neuralMapper: string;
} {
    const config = getModelConfig();
    const onnxBasePath = config.paths.onnxBasePath;

    return {
        polyFeatures: `${onnxBasePath}poly_features.onnx`,
        scoreMapper: `${onnxBasePath}score_mapper.onnx`,
        neuralMapper: `${onnxBasePath}neural_mapper.onnx`
    };
}

/**
 * Get ensemble weights JSON file URL
 * @returns URL path to universal_score_weights.json
 */
export function getWeightsUrl(): string {
    const config = getModelConfig();
    return config.paths.weightsPath;
}

function getRemoteHost(): string {
    const configured = import.meta.env.VITE_MODEL_BASE_URL;
    if (configured && /^https?:\/\//.test(configured) && !configured.includes('huggingface.co')) {
        return configured.replace(/\/$/, '');
    }

    if (typeof globalThis !== 'undefined' && 'location' in globalThis && globalThis.location?.origin) {
        return globalThis.location.origin;
    }

    return '';
}