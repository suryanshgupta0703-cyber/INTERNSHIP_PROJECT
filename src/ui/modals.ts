/**
 * Modal Management
 * Type-safe modal system with accessibility support
 */

import { getElement } from '../utils/dom.ts';
import type { ModalType } from '../types';

/**
 * Modal content interface for type safety
 */
interface ModalContentItem {
    readonly title: string;
    readonly content: string;
}

/**
 * Modal content collection
 */
type ModalContentCollection = Record<ModalType, ModalContentItem>;

/**
 * Modal content data
 */
const modalContent: ModalContentCollection = {
    privacy: {
        title: 'Privacy Policy',
        content: `
            <div class="callout callout-privacy">
                <h4><strong>Absolute Privacy Guarantee</strong></h4>
                <p>This application operates entirely on your device. Zero data collection. Zero external requests. Complete privacy.</p>
            </div>

            <h2>Data Processing Architecture</h2>
            <p>ATS Resume Analyzer is built with privacy-by-design principles using a fully local, offline-first architecture. Every component of our system runs directly on your device without any external dependencies.</p>

            <h3>What Happens to Your Data</h3>
            <p><strong>Your resume and job descriptions are processed exclusively in your browser's memory</strong>. The data flows as follows:</p>
            <ul>
                <li>Files are read directly by your browser (no uploads to servers)</li>
                <li>AI analysis runs using local neural networks bundled with the application</li>
                <li>Results are computed and displayed locally</li>
                <li>All data is automatically discarded when you close the browser tab</li>
            </ul>

            <h3>Zero Data Collection</h3>
            <p>We have designed our system to make data collection technically impossible:</p>
            <ul>
                <li><strong>No servers</strong> - Static files and AI models hosted on CDN without tracking</li>
                <li><strong>No databases</strong> - Nothing is stored or logged anywhere</li>
                <li><strong>No analytics</strong> - No tracking pixels, cookies, or behavioral analysis</li>
                <li><strong>No external API calls</strong> - All processing happens locally in your browser</li>
                <li><strong>Model loading only</strong> - After initial download, AI models are cached and the app works offline</li>
            </ul>

            <div class="callout callout-info">
                <h4><strong>Technical Implementation</strong></h4>
                <p>Our AI models are bundled as WebAssembly modules that run entirely in your browser. PDF processing uses client-side JavaScript libraries. No data ever leaves your device.</p>
            </div>

            <h3>Open Source Transparency</h3>
            <p>This application is fully open source. You can review every line of code, verify our privacy claims, and even run it completely offline. The source code demonstrates our commitment to privacy through technical implementation, not just policy statements.</p>

            <h3>Your Rights</h3>
            <p>Since we collect no data, traditional privacy rights (access, rectification, deletion) are not applicable. Instead, you have something better: <strong>complete control</strong>. Your data never leaves your device, so you maintain absolute ownership and privacy at all times.</p>

            <div class="callout callout-info">
                <h4><strong>Compliance</strong></h4>
                <p>Our zero-data architecture ensures automatic compliance with GDPR, CCPA, and all privacy regulations worldwide.</p>
            </div>

            <p><em>This Privacy Policy is effective as of October 2025 and reflects our fully local, offline-first architecture.</em></p>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <div class="callout callout-info">
                <h4><strong>Simple & Fair Terms</strong></h4>
                <p>Use our offline AI resume analyzer freely and responsibly. Open source, transparent, and built for your success.</p>
            </div>

            <h2>Service Overview</h2>
            <p>ATS Resume Analyzer is a <strong>completely free, open-source, offline-first AI resume analyzer</strong>. It runs entirely in your browser using locally bundled neural networks to provide instant ATS compatibility analysis without any privacy concerns.</p>

            <h3>Technical Architecture</h3>
            <p>Our service operates using:</p>
            <ul>
                <li><strong>Local AI Models</strong> - All analysis runs on your device using WebAssembly</li>
                <li><strong>Client-side PDF Processing</strong> - Documents never leave your browser</li>
                <li><strong>Offline Capability</strong> - Works without internet after initial load</li>
                <li><strong>Open Source Code</strong> - Complete transparency and community-driven development</li>
            </ul>

            <h3>Permitted Use</h3>
            <p>You are welcome to:</p>
            <ul>
                <li>Use the service for personal or professional resume optimization</li>
                <li>Analyze unlimited resumes and job descriptions</li>
                <li>Share insights and recommendations with others</li>
                <li>Run the service completely offline</li>
                <li>Fork, modify, and distribute the open source code (subject to license terms)</li>
                <li>Use for educational or research purposes</li>
            </ul>

            <h3>Service Limitations</h3>
            <p>Please do not:</p>
            <ul>
                <li>Attempt to extract or reverse-engineer the trained AI model weights</li>
                <li>Use the service for automated scraping or excessive bulk processing</li>
                <li>Redistribute the service under misleading branding or claims</li>
                <li>Attempt to circumvent the offline-first, privacy-preserving design</li>
            </ul>

            <div class="callout callout-warning">
                <h4><strong>AI Analysis Disclaimer</strong></h4>
                <p>Our AI provides automated analysis for informational purposes only. Resume optimization involves subjective factors that vary by industry, role, and company culture. Always combine our insights with professional judgment and human expertise.</p>
            </div>

            <h3>Intellectual Property</h3>
            <p>This service is built using:</p>
            <ul>
                <li><strong>Open Source Components</strong> - Licensed under various open source licenses</li>
                <li><strong>Public AI Models</strong> - Based on publicly available transformer architectures</li>
                <li><strong>Community Contributions</strong> - Welcome and encouraged under our project license</li>
            </ul>

            <h3>No Warranties</h3>
            <p>This free service is provided "as-is" without warranties of any kind. We strive for accuracy and reliability, but cannot guarantee perfect results. The offline-first design ensures maximum availability, but individual browser limitations may affect performance.</p>

            <div class="callout callout-info">
                <h4><strong>Open Source Commitment</strong></h4>
                <p>This entire application is open source. You can review, audit, and contribute to the code. True transparency through technical implementation.</p>
            </div>

            <p><em>These Terms of Service are effective as of October 2025 and reflect our commitment to free, open, and privacy-respecting software.</em></p>
        `
    },
    cookies: {
        title: 'Cookies & Tracking Policy',
        content: `
            <div class="callout callout-privacy">
                <h4><strong>Zero Tracking Commitment</strong></h4>
                <p>No cookies. No tracking. No analytics. No persistent storage. Complete browsing privacy guaranteed.</p>
            </div>

            <h2>Technical Implementation of Privacy</h2>
            <p>ATS Resume Analyzer is architected to make tracking technically impossible. Our offline-first, locally-bundled approach ensures that <strong>no data ever leaves your device</strong>, eliminating the need for cookies or any form of persistent tracking.</p>

            <h3>What We Don't Use</h3>
            <ul>
                <li><strong>No HTTP Cookies</strong> - Neither session nor persistent cookies are set</li>
                <li><strong>No Local Storage</strong> - No data persisted in browser storage APIs</li>
                <li><strong>No Session Storage</strong> - No temporary data stored between page loads</li>
                <li><strong>No IndexedDB</strong> - No client-side database storage</li>
                <li><strong>No Web SQL</strong> - No deprecated local database features</li>
                <li><strong>No Tracking Pixels</strong> - No invisible images for analytics</li>
                <li><strong>No Fingerprinting</strong> - No collection of device or browser characteristics</li>
                <li><strong>No Third-Party Analytics</strong> - No Google Analytics, Facebook Pixel, or similar</li>
            </ul>

            <h3>How Our System Works</h3>
            <p>Our zero-tracking architecture functions as follows:</p>
            <ul>
                <li><strong>Static Files Only</strong> - All code and models are served as static assets</li>
                <li><strong>Local Processing</strong> - AI analysis runs entirely in browser memory (RAM)</li>
                <li><strong>Memory-Only Operations</strong> - Data exists only during active browser session</li>
                <li><strong>Automatic Cleanup</strong> - All data discarded when closing browser tab</li>
            </ul>

            <div class="callout callout-info">
                <h4><strong>Browser Cache Behavior</strong></h4>
                <p>Your browser may cache our static files (JavaScript, CSS, AI models) for performance. This is standard browser behavior and contains no personal data - only application code and AI model weights.</p>
            </div>

            <h3>Third-Party Services</h3>
            <p>We have eliminated all tracking and external dependencies:</p>
            <ul>
                <li><strong>Self-Hosted Models</strong> - AI models served from your own CDN with no tracking</li>
                <li><strong>No Third-Party CDNs</strong> - All code and libraries bundled via npm packages</li>
                <li><strong>No Font Services</strong> - Uses system fonts (no Google Fonts)</li>
                <li><strong>No External APIs</strong> - No remote service calls for data processing</li>
                <li><strong>No Analytics Services</strong> - No behavioral tracking or usage analytics</li>
            </ul>

            <h3>Open Source Verification</h3>
            <p>Our privacy claims are verifiable:</p>
            <ul>
                <li><strong>Source Code Audit</strong> - Every line of code is publicly available</li>
                <li><strong>Network Monitoring</strong> - Run developer tools to verify no external requests</li>
                <li><strong>Offline Testing</strong> - Disconnect from internet and verify full functionality</li>
                <li><strong>Community Oversight</strong> - Open source community can audit and verify</li>
            </ul>

            <div class="callout callout-info">
                <h4><strong>Legal Compliance</strong></h4>
                <p>Our zero-tracking approach ensures automatic compliance with cookie laws (GDPR, CCPA, ePrivacy Directive) worldwide. No consent banners needed because no tracking occurs.</p>
            </div>

            <h3>Your Privacy Rights</h3>
            <p>Since we don't track or store any data:</p>
            <ul>
                <li><strong>Nothing to Delete</strong> - No data exists to be deleted</li>
                <li><strong>Nothing to Access</strong> - No data exists to be accessed</li>
                <li><strong>Nothing to Correct</strong> - No data exists to be corrected</li>
                <li><strong>Nothing to Port</strong> - No data exists to be exported</li>
            </ul>

            <div class="callout callout-privacy">
                <h4><strong>Maximum Privacy by Design</strong></h4>
                <p>We've achieved the highest possible level of privacy: technical impossibility of data collection. Your privacy is protected by architecture, not just policy.</p>
            </div>

            <p><em>This Cookies & Tracking Policy is effective as of October 2025 and reflects our zero-tracking, offline-first technical architecture.</em></p>
        `
    },
    sponsor: {
        title: 'Support This Project',
        content: `
            <div class="callout callout-info">
                <h4><strong>Support Open Source AI Innovation</strong></h4>
                <p>This is a free, open-source project built to help job seekers optimize their resumes for Applicant Tracking Systems.</p>
            </div>

            <h2>About This Project</h2>
            <p>ATS Resume Analyzer is a <strong>free, open-source, privacy-first AI resume analyzer</strong> that helps job seekers optimize their resumes for Applicant Tracking Systems.</p>

            <h3>Project Features</h3>
            <ul>
                <li><strong>Privacy-First</strong> - All processing happens locally in your browser</li>
                <li><strong>Open Source</strong> - Fully transparent and auditable code</li>
                <li><strong>Free to Use</strong> - No cost, no registration required</li>
                <li><strong>Advanced AI</strong> - Uses state-of-the-art natural language processing</li>
            </ul>

            <h3>Technology Stack</h3>
            <p>Built with modern web technologies including Transformers.js, ONNX Runtime Web, and WebAssembly for local AI inference.</p>

            <div class="callout callout-info">
                <h4><strong>Open Source</strong></h4>
                <p>This project is open source and available for review, contribution, and self-hosting.</p>
            </div>
        `
    },
    about: {
        title: 'About ATS Resume Analyzer',
        content: `
            <div class="callout callout-info">
                <h4><strong>Mission Statement</strong></h4>
                <p>Democratizing access to ATS optimization tools while maintaining complete privacy and user control.</p>
            </div>

            <h2>What is ATS Resume Analyzer?</h2>
            <p>ATS Resume Analyzer is a free, open-source application developed by <strong>Suryansh Gupta</strong> as an internship project. It helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). Unlike other tools, ATS Resume Analyzer runs entirely in your browser, ensuring complete privacy and offline functionality.</p>

            <h3>Key Features</h3>
            <ul>
                <li><strong>100% Local Processing</strong> - All analysis happens on your device</li>
                <li><strong>No Data Collection</strong> - Your information never leaves your browser</li>
                <li><strong>Advanced AI Analysis</strong> - Uses state-of-the-art natural language processing</li>
                <li><strong>Real-time Feedback</strong> - Instant analysis and recommendations</li>
                <li><strong>Universal Compatibility</strong> - Works with all industries and job types</li>
                <li><strong>Open Source</strong> - Transparent, auditable, and modifiable</li>
            </ul>

            <h3>Technology Stack</h3>
            <p>ATS Resume Analyzer is built using cutting-edge web technologies:</p>
            <ul>
                <li><strong>AI Models:</strong> HuggingFace Transformers with ONNX optimization</li>
                <li><strong>Frontend:</strong> Modern JavaScript with progressive enhancement</li>
                <li><strong>Processing:</strong> WebAssembly for high-performance AI inference</li>
                <li><strong>Privacy:</strong> Client-side architecture with zero server dependencies</li>
            </ul>

            <h3>How It Works</h3>
            <ol>
                <li><strong>Input:</strong> Paste your resume and target job description</li>
                <li><strong>Analysis:</strong> Local AI models analyze semantic compatibility</li>
                <li><strong>Scoring:</strong> Machine learning algorithms generate compatibility scores</li>
                <li><strong>Recommendations:</strong> Targeted suggestions for improvement</li>
                <li><strong>Privacy:</strong> All data stays on your device and is discarded when you leave</li>
            </ol>

            <h3>Open Source Commitment</h3>
            <p>We believe in transparency and community-driven development:</p>
            <ul>
                <li>Complete source code is available for review</li>
                <li>Contributions and improvements are welcome</li>
                <li>No hidden algorithms or black-box processing</li>
                <li>Community feedback drives feature development</li>
            </ul>

            <div class="callout callout-info">
                <h4><strong>Academic Foundation</strong></h4>
                <p>Our algorithms are based on peer-reviewed research in natural language processing and information retrieval, adapted specifically for resume analysis and ATS optimization.</p>
            </div>

            <h3>Future Development</h3>
            <p>We're continuously improving ATS Resume Analyzer with:</p>
            <ul>
                <li>Enhanced AI models for better accuracy</li>
                <li>Support for additional file formats</li>
                <li>More detailed analysis and recommendations</li>
                <li>Improved accessibility and user experience</li>
            </ul>

            <p><strong>Version:</strong> 1.0.0 | <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

            <div class="callout callout-info" style="margin-top: 20px;">
                <h4><strong>About the Developer</strong></h4>
                <p>This project was developed by <strong>Suryansh Gupta</strong> as an internship project demonstrating modern web development skills, AI integration, and privacy-first application design.</p>
            </div>
        `
    }
} as const;

/**
 * Modal state management
 */
interface ModalState {
    currentModal: ModalType | null;
    isModalOpen: boolean;
    focusStack: HTMLElement[];
}

const modalState: ModalState = {
    currentModal: null,
    isModalOpen: false,
    focusStack: []
};

/**
 * Open modal with specified content type
 * @param type - Type of modal content to display
 */
export const openModal = (type: ModalType): void => {
    try {
        console.log('Opening modal:', type);
        const modal = getElement<HTMLElement>('modal');
        const modalTitleElement = getElement<HTMLElement>('modalTitle');
        const modalContentElement = getElement<HTMLElement>('modalContent');

        if (!modal || !modalTitleElement || !modalContentElement) {
            console.warn('Modal elements not found', { modal, modalTitleElement, modalContentElement });
            return;
        }

        const content = modalContent[type];
        if (!content) {
            console.warn(`Unknown modal type: ${type}`);
            return;
        }

        console.log('Modal content found:', content.title);

        // Store current focus for restoration
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            modalState.focusStack.push(activeElement);
        }

        // Update modal content
        modalTitleElement.textContent = content.title;
        modalContentElement.innerHTML = content.content;

        // Update subtitle based on modal type
        const subtitle = modal.querySelector<HTMLElement>('.modal-subtitle');
        if (subtitle) {
            const subtitles = {
                privacy: 'Complete Privacy. Local Processing. Zero Data Collection.',
                terms: 'Open Source. Free Forever. Community Driven.',
                cookies: 'Zero Tracking. No Analytics. Maximum Privacy.',
                sponsor: 'Support Privacy-First AI Development.',
                about: 'Democratizing ATS Optimization. Privacy First.'
            };
            subtitle.textContent = subtitles[type] || 'Transparent. Honest. Privacy-First.';
        }

        // Show modal with accessibility attributes
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modalTitle');

        // Focus management for accessibility
        const closeButton = modal.querySelector<HTMLElement>('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }

        // Update state
        modalState.currentModal = type;
        modalState.isModalOpen = true;

        // Prevent body scrolling
        document.body.style.overflow = 'hidden';

        // Add event listeners for modal interaction
        addModalEventListeners();

    } catch (error) {
        console.error('Error opening modal:', error);
    }
};

/**
 * Close modal with proper cleanup
 */
export const closeModal = (): void => {
    try {
        const modal = getElement<HTMLElement>('modal');
        if (!modal) return;

        // Hide modal
        modal.classList.add('hidden');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');

        // Restore focus
        if (modalState.focusStack.length > 0) {
            const previousFocus = modalState.focusStack.pop();
            if (previousFocus && document.contains(previousFocus)) {
                previousFocus.focus();
            }
        }

        // Restore body scrolling
        document.body.style.overflow = '';

        // Update state
        modalState.currentModal = null;
        modalState.isModalOpen = false;

        // Remove event listeners
        removeModalEventListeners();

    } catch (error) {
        console.error('Error closing modal:', error);
    }
};

/**
 * Setup modal event listeners for interaction and accessibility
 */
export const setupModalEventListeners = (): void => {
    // Modal close button click
    const closeButton = document.querySelector<HTMLElement>('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Modal backdrop click
    const modal = getElement<HTMLElement>('modal');
    if (modal) {
        modal.addEventListener('click', (e: Event) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
};

/**
 * Add modal-specific event listeners when modal is open
 */
const addModalEventListeners = (): void => {
    document.addEventListener('keydown', handleModalKeydown);
    document.addEventListener('focusin', handleModalFocusTrap);
};

/**
 * Remove modal-specific event listeners when modal is closed
 */
const removeModalEventListeners = (): void => {
    document.removeEventListener('keydown', handleModalKeydown);
    document.removeEventListener('focusin', handleModalFocusTrap);
};

/**
 * Handle keyboard interactions for modal
 */
const handleModalKeydown = (e: KeyboardEvent): void => {
    if (!modalState.isModalOpen) return;

    // Close modal on Escape key
    if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
    }
};

/**
 * Handle focus trapping within modal
 */
const handleModalFocusTrap = (e: FocusEvent): void => {
    if (!modalState.isModalOpen) return;

    const modal = getElement<HTMLElement>('modal');
    if (!modal) return;

    const target = e.target as HTMLElement;

    // If focus is moving outside modal, redirect it back
    if (!modal.contains(target)) {
        const focusableElements = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
};

// Default export for compatibility
export default {
    openModal,
    closeModal,
    setupModalEventListeners
} as const;
