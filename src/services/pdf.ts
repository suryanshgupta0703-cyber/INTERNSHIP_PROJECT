/**
 * PDF Processing Service
 * Handles PDF file upload and text extraction with full type safety
 */

import { getElement } from '../utils/dom.ts';
import { showError, showSuccess } from '../ui/alerts.ts';
import { formatFileSize } from '../utils/helpers.ts';
import type {
    PDFProcessingResult,
    PDFMetadata,
    PDFUploadConfig,
    ATSError,
    ATSErrorType
} from '../types';

// PDF.js type declarations for better type safety
declare global {
    interface Window {
        pdfjsLib: {
            getDocument(src: Uint8Array): {
                promise: Promise<PDFDocument>;
            };
        };
    }
}

interface PDFDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPage>;
}

interface PDFPage {
    getTextContent(): Promise<TextContent>;
}

interface TextContent {
    items: TextItem[];
}

interface TextItem {
    str: string;
    transform?: number[];
    width?: number;
    height?: number;
}

/**
 * Custom error class for PDF processing errors
 */
class PDFProcessingError extends Error implements ATSError {
    public readonly type: ATSErrorType = 'PDF_PROCESSING_ERROR';
    public readonly code?: string;
    public readonly details?: Record<string, unknown>;
    public readonly timestamp: string;

    constructor(
        message: string,
        code?: string,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'PDFProcessingError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * PDF upload configuration with sensible defaults
 */
const DEFAULT_CONFIG: PDFUploadConfig = {
    maxSizeMB: 10,
    allowedTypes: ['application/pdf'],
    enableMetadataExtraction: false
} as const;

/**
 * Character counter function type
 */
type CharCounterFunction = (textarea: HTMLTextAreaElement) => void;

/**
 * Upload event interface for better type safety
 */
interface UploadEvent {
    target: {
        files: FileList | null;
    };
}

/**
 * Setup PDF upload functionality with comprehensive error handling
 * @param updateCharCounter - Function to update character counters
 * @param config - Upload configuration options
 */
export const setupPDFUploads = (
    updateCharCounter: CharCounterFunction,
    config: Partial<PDFUploadConfig> = {}
): void => {
    const uploadConfig = { ...DEFAULT_CONFIG, ...config };

    try {
        // Cache DOM elements with null safety
        const elements = {
            resumeFileInput: getElement<HTMLInputElement>('resumeFileInput'),
            resumeUploadArea: getElement<HTMLElement>('resumeUploadArea'),
            jobFileInput: getElement<HTMLInputElement>('jobFileInput'),
            jobUploadArea: getElement<HTMLElement>('jobUploadArea')
        };

        // Setup resume PDF upload
        if (elements.resumeUploadArea && elements.resumeFileInput) {
            setupUploadArea(
                elements.resumeUploadArea,
                elements.resumeFileInput,
                'resume',
                updateCharCounter,
                uploadConfig
            );
        }

        // Setup job PDF upload
        if (elements.jobUploadArea && elements.jobFileInput) {
            setupUploadArea(
                elements.jobUploadArea,
                elements.jobFileInput,
                'job',
                updateCharCounter,
                uploadConfig
            );
        }
    } catch (error) {
        console.error('Failed to setup PDF uploads:', error);
        showError('Failed to initialize PDF upload functionality');
    }
};

/**
 * Setup individual upload area with drag & drop support
 */
const setupUploadArea = (
    uploadArea: HTMLElement,
    fileInput: HTMLInputElement,
    type: 'resume' | 'job',
    updateCharCounter: CharCounterFunction,
    config: PDFUploadConfig
): void => {
    // Create cleanup functions for better memory management
    const cleanup: (() => void)[] = [];

    // Click to upload handler
    const clickHandler = (): void => fileInput.click();
    uploadArea.addEventListener('click', clickHandler);
    cleanup.push(() => uploadArea.removeEventListener('click', clickHandler));

    // File selection handler
    const changeHandler = (e: Event): Promise<void> =>
        handlePDFUpload(e as unknown as UploadEvent, type, updateCharCounter, config);
    fileInput.addEventListener('change', changeHandler);
    cleanup.push(() => fileInput.removeEventListener('change', changeHandler));

    // Drag and drop handlers with proper type safety
    const dragOverHandler = (e: DragEvent): void => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    };
    uploadArea.addEventListener('dragover', dragOverHandler);
    cleanup.push(() => uploadArea.removeEventListener('dragover', dragOverHandler));

    const dragLeaveHandler = (): void => {
        uploadArea.classList.remove('dragover');
    };
    uploadArea.addEventListener('dragleave', dragLeaveHandler);
    cleanup.push(() => uploadArea.removeEventListener('dragleave', dragLeaveHandler));

    const dropHandler = (e: DragEvent): Promise<void> => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            return handlePDFUpload(
                { target: { files: e.dataTransfer.files } },
                type,
                updateCharCounter,
                config
            );
        }
        return Promise.resolve();
    };
    uploadArea.addEventListener('drop', dropHandler);
    cleanup.push(() => uploadArea.removeEventListener('drop', dropHandler));

    // Store cleanup functions for potential future use
    (uploadArea as any).__pdfUploadCleanup = cleanup;
};

/**
 * Handle PDF file upload and processing with comprehensive validation
 */
const handlePDFUpload = async (
    event: UploadEvent,
    type: 'resume' | 'job',
    updateCharCounter: CharCounterFunction,
    config: PDFUploadConfig
): Promise<void> => {
    const file = event.target.files?.[0];

    // Comprehensive file validation
    const validation = validateFile(file, config);
    if (!validation.isValid) {
        showError(validation.error || 'Invalid file');
        return;
    }

    const validatedFile = file!; // Safe assertion after validation

    // Cache DOM elements for this upload
    const elements = {
        fileInfo: getElement<HTMLElement>(`${type}FileInfo`),
        processing: getElement<HTMLElement>(`${type}PdfProcessing`)
    };

    try {
        // Show file info
        if (elements.fileInfo) {
            elements.fileInfo.classList.remove('hidden');
            elements.fileInfo.textContent = `Selected: ${validatedFile.name} (${formatFileSize(validatedFile.size)})`;
        }

        // Show processing message
        updateProcessingStatus(elements.processing, 'processing');

        const result = await extractTextFromPDF(validatedFile, config);

        if (result.text.trim()) {
            await handleSuccessfulExtraction(result, type, updateCharCounter, elements);
        } else {
            handleExtractionFailure('No text could be extracted from this PDF.', elements);
        }
    } catch (error) {
        console.error('PDF processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        handleExtractionFailure(`Error processing PDF: ${errorMessage}`, elements, error);
    }
};

/**
 * Validate uploaded file against configuration
 */
const validateFile = (
    file: File | null | undefined,
    config: PDFUploadConfig
): { isValid: boolean; error?: string } => {
    if (!file) {
        return { isValid: false, error: 'No file selected.' };
    }

    if (!config.allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Please select a valid PDF file.' };
    }

    const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { isValid: false, error: `File size must be less than ${config.maxSizeMB}MB.` };
    }

    return { isValid: true };
};

/**
 * Update processing status with visual feedback
 */
const updateProcessingStatus = (
    element: HTMLElement | null,
    status: 'processing' | 'success' | 'error',
    message?: string
): void => {
    if (!element) return;

    element.classList.remove('hidden');

    switch (status) {
        case 'processing':
            element.innerHTML = '<div style="color: var(--primary-gold); font-weight: 600;">📄 Extracting text from PDF...</div>';
            break;
        case 'success':
            element.innerHTML = `<div style="color: #4caf50; font-weight: 600;">✅ ${message || 'Text extracted successfully!'}</div>`;
            break;
        case 'error':
            element.innerHTML = `<div style="color: #f44336; font-weight: 600;">❌ ${message || 'Error processing PDF.'}</div>`;
            break;
    }
};

/**
 * Handle successful text extraction
 */
const handleSuccessfulExtraction = async (
    result: PDFProcessingResult,
    type: 'resume' | 'job',
    updateCharCounter: CharCounterFunction,
    elements: { processing: HTMLElement | null }
): Promise<void> => {
    // Update the corresponding textarea
    const textareaId = type === 'resume' ? 'resume' : 'jobDescription';
    const textarea = getElement<HTMLTextAreaElement>(textareaId);

    if (textarea) {
        textarea.value = result.text;
        updateCharCounter(textarea);
    }

    // Show success message
    updateProcessingStatus(
        elements.processing,
        'success',
        `Text extracted successfully! (${result.text.length} characters, ${result.pageCount} pages)`
    );

    // Switch to text tab to show the extracted content
    setTimeout(() => {
        const textTab = document.querySelector<HTMLButtonElement>(
            `button[data-section="${type}"][data-type="text"]`
        );
        textTab?.click();
    }, 500);

    showSuccess('PDF text extracted successfully!');
};

/**
 * Handle extraction failure
 */
const handleExtractionFailure = (
    message: string,
    elements: { processing: HTMLElement | null },
    error?: unknown
): void => {
    updateProcessingStatus(elements.processing, 'error', message);
    showError(message);

    if (error && error instanceof Error) {
        console.error('PDF extraction details:', error);
    }
};

/**
 * Extract text content from PDF file with metadata
 */
export const extractTextFromPDF = async (
    file: File,
    config: PDFUploadConfig = DEFAULT_CONFIG
): Promise<PDFProcessingResult> => {
    if (!window.pdfjsLib) {
        throw new PDFProcessingError(
            'PDF.js library not loaded',
            'PDFJS_NOT_LOADED'
        );
    }

    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function(): Promise<void> {
            try {
                if (!this.result || !(this.result instanceof ArrayBuffer)) {
                    throw new PDFProcessingError(
                        'Failed to read file as ArrayBuffer',
                        'FILE_READ_ERROR'
                    );
                }

                const typedArray = new Uint8Array(this.result);
                const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                const pageTexts: string[] = [];

                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    try {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map(item => item.str)
                            .join(' ')
                            .trim();

                        if (pageText) {
                            pageTexts.push(pageText);
                            fullText += pageText + '\n';
                        }
                    } catch (pageError) {
                        console.warn(`Failed to extract text from page ${i}:`, pageError);
                        // Continue with other pages
                    }
                }

                const result: PDFProcessingResult = {
                    text: fullText.trim(),
                    pageCount: pdf.numPages,
                    metadata: config.enableMetadataExtraction
                        ? await extractMetadata(pdf)
                        : undefined
                };

                resolve(result);
            } catch (error) {
                console.error('PDF parsing error:', error);
                reject(new PDFProcessingError(
                    'Failed to parse PDF content',
                    'PDF_PARSE_ERROR',
                    { originalError: error }
                ));
            }
        };

        fileReader.onerror = (): void => {
            reject(new PDFProcessingError(
                'Failed to read file',
                'FILE_READ_ERROR'
            ));
        };

        fileReader.readAsArrayBuffer(file);
    });
};

/**
 * Extract metadata from PDF document (optional feature)
 */
const extractMetadata = async (_pdf: PDFDocument): Promise<PDFMetadata> => {
    try {
        // PDF.js metadata extraction would go here
        // This is a placeholder for future metadata extraction
        return {
            title: undefined,
            author: undefined,
            subject: undefined,
            keywords: undefined,
            creator: undefined,
            producer: undefined,
            creationDate: undefined,
            modificationDate: undefined
        };
    } catch (error) {
        console.warn('Failed to extract PDF metadata:', error);
        return {};
    }
};

/**
 * Utility function to check if PDF processing is supported
 */
export const isPDFProcessingSupported = (): boolean => {
    return typeof window !== 'undefined' &&
           typeof window.pdfjsLib !== 'undefined' &&
           typeof FileReader !== 'undefined';
};

/**
 * Get supported file types for validation
 */
export const getSupportedFileTypes = (): readonly string[] => {
    return DEFAULT_CONFIG.allowedTypes;
};

/**
 * Get maximum file size in bytes
 */
export const getMaxFileSize = (config: Partial<PDFUploadConfig> = {}): number => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    return mergedConfig.maxSizeMB * 1024 * 1024;
};

/**
 * Cleanup upload areas (useful for component unmounting)
 */
export const cleanupPDFUploads = (): void => {
    const uploadAreas = [
        getElement('resumeUploadArea'),
        getElement('jobUploadArea')
    ];

    uploadAreas.forEach(area => {
        if (area && (area as any).__pdfUploadCleanup) {
            const cleanup: (() => void)[] = (area as any).__pdfUploadCleanup;
            cleanup.forEach(fn => fn());
            delete (area as any).__pdfUploadCleanup;
        }
    });
};

// Default export for compatibility
export default {
    setupPDFUploads,
    extractTextFromPDF,
    isPDFProcessingSupported,
    getSupportedFileTypes,
    getMaxFileSize,
    cleanupPDFUploads
} as const;