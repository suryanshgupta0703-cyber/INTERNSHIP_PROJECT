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
    const modelSource = import.meta.env.VITE_MODEL_SOURCE || (isProduction ? 'remote' : 'local');

    const isLocal = modelSource === 'local';

    // Base configuration
    const config: ModelConfig = {
        source: modelSource as 'local' | 'remote',
        allowLocalModels: isLocal,
        allowRemoteModels: !isLocal,
        // For remote (R2 with HF structure): Use base URL and standard HF path template
        // For local: Empty strings
        remoteHost: isLocal ? '' : (import.meta.env.VITE_MODEL_BASE_URL || 'https://huggingface.co'),
        remotePathTemplate: isLocal ? '' : '{model}/resolve/main/',
        paths: getPaths(isLocal)
    };

    return config;
}

/**
 * Get model paths based on environment
 */
function getPaths(isLocal: boolean): ModelPaths {
    // Use standard HuggingFace models that are publicly available
    // Xenova/all-MiniLM-L6-v2 is a widely used sentence transformer model
    const semanticModelName = import.meta.env.VITE_SEMANTIC_MODEL_PATH || 'Xenova/all-MiniLM-L6-v2';
    const domainModelName = import.meta.env.VITE_DOMAIN_MODEL_PATH || 'Xenova/all-MiniLM-L6-v2';

    if (isLocal) {
        // Local development - serve from public/models if downloaded, otherwise use remote
        const baseUrl = import.meta.env.VITE_MODEL_BASE_URL || '/models';
        const semanticModel = `${baseUrl}/${semanticModelName}`;
        const domainModel = `${baseUrl}/${domainModelName}`;

        return {
            semanticModel,
            domainModel,
            baseUrl,
            onnxBasePath: `${semanticModel}/onnx/`,
            weightsPath: `${semanticModel}/universal_score_weights.json`
        };
    } else {
        // Remote - Use HuggingFace directly
        const baseUrl = import.meta.env.VITE_MODEL_BASE_URL || 'https://huggingface.co';

        // For standard HF models, use the model name directly
        return {
            semanticModel: semanticModelName,
            domainModel: domainModelName,
            baseUrl,
            onnxBasePath: `${baseUrl}/${semanticModelName}/resolve/main/onnx/`,
            weightsPath: `${baseUrl}/${semanticModelName}/resolve/main/universal_score_weights.json`
        };
    }
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