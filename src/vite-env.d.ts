/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MODEL_SOURCE?: string;
    readonly VITE_MODEL_BASE_URL?: string;
    readonly VITE_SEMANTIC_MODEL_PATH?: string;
    readonly VITE_DOMAIN_MODEL_PATH?: string;
    readonly VITE_DEBUG_MODE?: string;
    readonly VITE_ENABLE_CACHE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
