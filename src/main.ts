/**
 * ATS Score Predictor - Main Application Entry Point
 *
 */

// Import PDF.js for local PDF processing with proper types
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker: prefer local bundled worker for same-origin performance and reliability
try {
    const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
} catch {
    const pdfjsVersion = '5.7.284';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`;
}
(window as any).pdfjsLib = pdfjsLib;

// Import styles
import './styles/main.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/results.css?v=2';

// Import core modules
import { ATSWorkerClient } from './workers/ats-worker-client.ts';

// Import utilities
import { getElement, getElements, updateCharCounter } from './utils/dom.ts';
import { isMobileDevice, MobileStatus, initializeMobileOptimizations } from './utils/device.ts';
import { debounce } from './utils/helpers.ts';

// Import UI modules
import { updateStatus, showError } from './ui/alerts.ts';
import { switchInputView, switchTab, toggleFAQ, setupKeyboardNavigation, toggleMobileMenu } from './ui/navigation.ts';
import { openModal, setupModalEventListeners } from './ui/modals.ts';
import { startProgressSimulation, updateAnalysisProgress, completeProgress, resetProgress, showModelDetailsModal, renderSkillMatchMap } from './ui/analysis.ts';

// Import services
import { loadSampleResume, loadSampleJob, clearSampleSelection } from './services/samples.ts';
import { setupPDFUploads } from './services/pdf.ts';

// Import types
import type {
    ATSEngineConfig,
    ATSAnalysisResult,
    ModelInfo
} from './types';

// ===== CONFIGURATION =====

/**
 * Main application configuration
 */
const ATS_CONFIG: ATSEngineConfig = {
    modelPath: '',  // Model path configured via environment variables
    enableRecommendations: true,
    privacy: 'strict',
    enableDebugMode: true,
    enablePerformanceMetrics: true
} as const;

// ===== STATE MANAGEMENT =====

/**
 * Application state interface
 */
interface ApplicationState {
    atsWorker: ATSWorkerClient | null;
    isEngineReady: boolean;
    mobileStatus: MobileStatus;
}

/**
 * Global application state
 */
const appState: ApplicationState = {
    atsWorker: null,
    isEngineReady: false,
    mobileStatus: new MobileStatus()
};

// ===== ATS ENGINE INITIALIZATION =====

/**
 * Initialize the ATS Engine with comprehensive error handling
 */
async function initializeATSEngine(): Promise<ATSWorkerClient> {
    try {
        updateStatus('Initializing ATS Engine...', 'loading');

        // Initialize mobile status on mobile devices
        if (isMobileDevice()) {
            appState.mobileStatus.show('Loading AI Models...');
        }

        // Create new ATS Worker Client instance
        appState.atsWorker = new ATSWorkerClient();

        // Set up event listeners for status updates
        appState.atsWorker.on('statusUpdate', (data: unknown) => {
            const message = data as string;
            updateStatus(message, 'loading');
            updateAnalysisProgress(message);

            if (isMobileDevice()) {
                let mobileMessage = message;
                if (message.includes('Loading')) {
                    mobileMessage = 'Loading Models...';
                } else if (message.includes('Ready')) {
                    mobileMessage = 'Ready!';
                } else if (message.includes('Downloading')) {
                    mobileMessage = 'Downloading...';
                }
                appState.mobileStatus.update(mobileMessage);
            }
        });

        appState.atsWorker.on('error', (data: unknown) => {
            const message = typeof data === 'string' ? data : 'AI model failed to load';
            showError(message);
            updateStatus('AI model failed to load', 'error');

            if (isMobileDevice()) {
                appState.mobileStatus.hide();
            }
        });

        appState.atsWorker.on('ready', (data: unknown) => {
            console.log('[Main] Ready event received:', data);
            const info = data as any;
            appState.isEngineReady = true;

            // Cache UI elements for better performance
            const elements = getElements(['predictBtn', 'statusDot']);

            updateStatus('ATS Engine ready', 'ready');

            if (elements.predictBtn) {
                console.log('[Main] Enabling predict button');
                (elements.predictBtn as HTMLButtonElement).disabled = false;
            }
            if (elements.statusDot) {
                elements.statusDot.className = 'status-dot ready';
            }

            // Hide mobile status when ready
            if (isMobileDevice()) {
                setTimeout(() => {
                    appState.mobileStatus.hide();
                }, 1000);
            }

            // Show model info
            showModelInfo(info.modelInfo);
        });

        appState.atsWorker.on('analysisComplete', (data: unknown) => {
            const result = data as ATSAnalysisResult;
            console.debug('Analysis completed:', result.analysisId);
            updateStatus('Analysis complete', 'ready');
        });

        const initResult = await appState.atsWorker.initialize(ATS_CONFIG);
        if (!initResult.success) {
            throw new Error('AI models failed to load. Refresh the page to retry.');
        }

        return appState.atsWorker;

    } catch (error) {
        const errorMessage = `Engine initialization failed: ${error instanceof Error ? error.message : String(error)}`;
        showError(errorMessage);

        // Hide mobile status on error
        if (isMobileDevice()) {
            appState.mobileStatus.hide();
        }

        throw error;
    }
}

// ===== UI HELPER FUNCTIONS =====

/**
 * Set score results with comprehensive UI updates
 */
const setScore = (result: ATSAnalysisResult): void => {
    const score = result.overallScore;
    const similarity = result.breakdown.semanticMatch.score / 100;
    const modelInfo = result.modelInfo;

    // Cache DOM elements for better performance
    const scoreElements = getElements([
        'scoreValueText',
        'scoreGaugeValue',
        'scoreLabel',
        'similarityMetricFill',
        'similarityMetricText',
        'resultsSection',
        'analysisWarnings' // Add analysisWarnings to cached elements
    ]);

    // Update dashboard (left column)
    if (scoreElements.scoreValueText) {
        scoreElements.scoreValueText.textContent = score.toString();
    }

    if (scoreElements.scoreGaugeValue) {
        const circumference = 2 * Math.PI * 54; // 2 * PI * r, where r=54
        const offset = circumference - (score / 100) * circumference;
        const svgElement = scoreElements.scoreGaugeValue as unknown as SVGElement;
        svgElement.style.strokeDashoffset = offset.toString();
    }

    if (scoreElements.scoreLabel) {
        let matchText = 'Poor match';
        if (score >= 90) matchText = 'Excellent match';
        else if (score >= 80) matchText = 'Strong match';
        else if (score >= 70) matchText = 'Good match';
        else if (score >= 60) matchText = 'Fair match';
        else if (score >= 50) matchText = 'Some match';
        scoreElements.scoreLabel.textContent = matchText;
    }

    // Update key metrics
    if (scoreElements.similarityMetricFill && scoreElements.similarityMetricText) {
        const simPercent = similarity * 100;
        (scoreElements.similarityMetricFill as HTMLElement).style.width = `${simPercent}%`;
        scoreElements.similarityMetricText.textContent = `${simPercent.toFixed(1)}% Semantic Match`;
    }

    // Display warnings if any
    if (scoreElements.analysisWarnings) {
        scoreElements.analysisWarnings.innerHTML = ''; // Clear previous warnings
        if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                const warningDiv = document.createElement('div');
                warningDiv.className = 'analysis-warning-item'; // CSS class for styling
                warningDiv.textContent = warning;
                scoreElements.analysisWarnings!.appendChild(warningDiv);
            });
        }
    }

    // Update overview and technical details
    updateOverviewTab(result);
    updateTechnicalDetailsInOverview(modelInfo);
    renderSkillMatchMap(result);

    // Show results section with smooth animation
    if (scoreElements.resultsSection) {
        const resultsSection = scoreElements.resultsSection as HTMLElement;
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('show');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

function updateMatchDepthAnalysis(result: ATSAnalysisResult): void {
    // Match depth analysis based on actual model outputs
    const semanticScore = result.breakdown.semanticMatch.score;
    const domainScore = result.domainCompatibility || 50;

    // Calculate language match (terminology overlap) based on semantic similarity
    // Higher semantic score means better keyword/terminology alignment
    const languageMatch = Math.round(semanticScore * 1.05); // Slightly boost to reflect terminology strength

    if ((window as any).ATS_DEBUG_MODE) {
        console.log('📊 Match Depth Analysis:', {
            contentAlignment: semanticScore,
            domainExpertise: domainScore,
            languageMatch: languageMatch,
            overallStrength: result.overallScore
        });
    }
}

/**
 * Update overview tab with detailed analysis results
 */
function updateOverviewTab(result: ATSAnalysisResult): void {
    const overviewText = getElement<HTMLElement>('overviewText');
    if (!overviewText) return;

    const score = result.overallScore;
    let summaryHTML = '';

    if (score >= 90) {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-excellent">
                    <span class="match-label">Excellent match</span>
                </div>
            </div>
            <div class="match-description">
                <p>Your resume is <strong>exceptionally well-aligned</strong> with this job description. You've demonstrated strong experience and an excellent skills match.</p>
                <div class="next-steps">
                    <h5>Next Steps:</h5>
                    <ul>
                        <li>Focus on preparing specific examples of your accomplishments</li>
                        <li>Research the company culture and values</li>
                        <li>Practice interview scenarios for this role</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 80) {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-strong">
                    <span class="match-label">Strong match</span>
                </div>
            </div>
            <div class="match-description">
                <p>This is a <strong>great match</strong>! Your resume shows strong alignment with the role's core requirements.</p>
                <div class="next-steps">
                    <h5>Quick Improvements:</h5>
                    <ul>
                        <li>Focus on matching key skills and requirements mentioned in the job posting</li>
                        <li>Fine-tune your experience descriptions</li>
                        <li>Quantify your achievements where possible</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 70) {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-good">
                    <span class="match-label">Good match</span>
                </div>
            </div>
            <div class="match-description">
                <p>You have a <strong>solid foundation</strong>. Your resume is on the right track but could be more specifically tailored to this position.</p>
                <div class="next-steps">
                    <h5>Focus Areas:</h5>
                    <ul>
                        <li>Emphasize relevant skills mentioned in the job posting</li>
                        <li>Add more specific examples from your experience</li>
                        <li>Use industry-specific keywords and terminology</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 60) {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-fair">
                    <span class="match-label">Fair match</span>
                </div>
            </div>
            <div class="match-description">
                <p>Your resume has <strong>some alignment</strong> with the job, but needs significant improvement to stand out.</p>
                <div class="next-steps">
                    <h5>Action Required:</h5>
                    <ul>
                        <li>Highlight skills and experiences directly mentioned in the job description</li>
                        <li>Restructure your resume to emphasize relevant qualifications</li>
                        <li>Consider adding missing key competencies</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 50) {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-some">
                    <span class="match-label">Some match</span>
                </div>
            </div>
            <div class="match-description">
                <p>Your resume has <strong>some alignment</strong> with the job, but needs significant improvement to stand out.</p>
                <div class="next-steps">
                    <h5>Action Required:</h5>
                    <ul>
                        <li>Highlight skills and experiences directly mentioned in the job description</li>
                        <li>Restructure your resume to emphasize relevant qualifications</li>
                        <li>Consider adding missing key competencies</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        summaryHTML = `
            <div class="match-result-header">
                <div class="match-badge match-poor">
                    <span class="match-label">Poor match</span>
                </div>
            </div>
            <div class="match-description">
                <p>Your resume requires <strong>significant customization</strong> for this position. Focus on aligning your content with the job requirements.</p>
                <div class="next-steps">
                    <h5>Focus Areas:</h5>
                    <ul>
                        <li>Review the job description and identify key requirements</li>
                        <li>Rewrite your resume to emphasize relevant skills and experience</li>
                        <li>Use keywords and terminology from the job posting</li>
                        <li>Consider gaining additional qualifications if needed</li>
                    </ul>
                </div>
            </div>
        `;
    }

    overviewText.innerHTML = summaryHTML;

    // Update overview metrics
    updateOverviewMetrics(result);
    // Update match depth analysis
    updateMatchDepthAnalysis(result);
}

/**
 * Update overview metrics with animated progress bars
 */
function updateOverviewMetrics(result: ATSAnalysisResult): void {
    const metricElements = getElements([
        'contentMatchFill',
        'contentMatchText',
        'domainFill',
        'domainText',
        'skillFill',
        'skillText',
        'processingTimeFill',
        'processingTimeText'
    ]);

    if (metricElements.contentMatchFill && metricElements.contentMatchText) {
        const similarity = result.breakdown.semanticMatch.score;
        setTimeout(() => {
            (metricElements.contentMatchFill as HTMLElement).style.width = `${similarity}%`;
            metricElements.contentMatchText!.textContent = `${similarity.toFixed(1)}% Similar`;
        }, 300);
    }

    if (metricElements.domainFill && metricElements.domainText) {
        const domainCompat = result.domainCompatibility || 50;
        setTimeout(() => {
            (metricElements.domainFill as HTMLElement).style.width = `${domainCompat}%`;
            metricElements.domainText!.textContent = `${domainCompat.toFixed(0)}% Match`;
        }, 500);
    }

    if (metricElements.skillFill && metricElements.skillText) {
        const skillDepth = result.skillDepth || 0; // Use the new skillDepth from result

        setTimeout(() => {
            (metricElements.skillFill as HTMLElement).style.width = `${skillDepth}%`;
            metricElements.skillText!.textContent = `${skillDepth}% Skill Depth`;
        }, 600);
    }

    if (metricElements.processingTimeFill && metricElements.processingTimeText) {
        const timePercentage = Math.max(20, Math.min(100, (1 / result.processingTime) * 50));
        setTimeout(() => {
            (metricElements.processingTimeFill as HTMLElement).style.width = `${timePercentage}%`;
            metricElements.processingTimeText!.textContent = `${result.processingTime.toFixed(2)}s`;
        }, 700);
    }
}

/**
 * Show model information in the UI
 */
const showModelInfo = (modelInfo: ModelInfo): void => {
    const modelElements = getElements([
        'consolidatedStatus',
        'modelNameCompact',
        'modelSpecsCompact',
        'modelToggleCompact'
    ]);

    if (modelElements.consolidatedStatus && modelInfo) {
        if (modelElements.modelNameCompact) {
            modelElements.modelNameCompact.innerHTML = `<span aria-hidden="true">⚡</span> ${modelInfo.name}`;
        }

        if (modelElements.modelSpecsCompact) {
            const specs = `V1 • 58MB • Local`;
            modelElements.modelSpecsCompact.textContent = specs;
        }

        if (modelElements.modelToggleCompact) {
            modelElements.modelToggleCompact.setAttribute('title', 'Show model details');
        }
    }
};

/**
 * Update technical details in overview section
 */
const updateTechnicalDetailsInOverview = (modelInfo: ModelInfo): void => {
    const aiEngineDetailsScore = document.getElementById('aiEngineDetailsScore');

    if (aiEngineDetailsScore) {
        aiEngineDetailsScore.innerHTML = `
            <div class="model-name-display">
                ${modelInfo.name}
                <button class="model-info-icon-btn" type="button" aria-label="View model details">
                    <span>ⓘ</span>
                </button>
            </div>
            <div class="model-tech-details">V1 • 58MB • ONNX</div>
            <div class="model-tech-details" style="margin-top: 4px; font-size: 0.9em; opacity: 0.9;">Semantic + Domain + Ensemble Scoring</div>
        `;
    }
};


// ===== MAIN APPLICATION LOGIC =====

/**
 * Initialize the complete application
 */
async function initialize(): Promise<void> {
    try {
        // Initialize mobile optimizations
        initializeMobileOptimizations();

        // Initialize mobile status system
        appState.mobileStatus.init();

        // Initialize the ATS Engine
        await initializeATSEngine();

        // Setup keyboard navigation
        setupKeyboardNavigation();

        updateStatus('ATS Engine ready', 'ready');

    } catch (err) {
        const errorMessage = `Initialization failed: ${err instanceof Error ? err.message : String(err)}`;
        showError(errorMessage);

        // Hide mobile status on error
        if (isMobileDevice()) {
            appState.mobileStatus.hide();
        }
    }
}

/**
 * Predict ATS score with comprehensive error handling
 */
async function predictAtsScore(resumeText: string, jobText: string): Promise<ATSAnalysisResult | null> {
    if (!appState.atsWorker || !appState.isEngineReady) {
        showError('ATS Engine not ready. Please wait for initialization.');
        return null;
    }

    try {
        // Use the ATS Worker for core scoring functionality
        const result = await appState.atsWorker.score(resumeText, jobText);

        return result;

    } catch (error) {
        const errorMessage = `Analysis failed: ${error instanceof Error ? error.message : String(error)}`;
        showError(errorMessage);
        return null;
    }
}

// ===== EVENT LISTENERS =====

/**
 * Setup character counters for textarea
 */
const setupCharCounters = (): void => {
    const resumeTextarea = getElement<HTMLTextAreaElement>('resume');
    const jobTextarea = getElement<HTMLTextAreaElement>('jobDescription');

    if (resumeTextarea) {
        resumeTextarea.addEventListener('input', () => updateCharCounter(resumeTextarea));
        updateCharCounter(resumeTextarea); // Initialize
    }

    if (jobTextarea) {
        jobTextarea.addEventListener('input', () => updateCharCounter(jobTextarea));
        updateCharCounter(jobTextarea); // Initialize
    }
};

/**
 * Setup all application event listeners
 */
const setupEventListeners = (): void => {
    // Initialize PDF uploads
    setupPDFUploads(updateCharCounter);

    // Initialize character counters
    setupCharCounters();

    // Setup modal event listeners
    setupModalEventListeners();

    const ctaButton = document.querySelector<HTMLAnchorElement>('.hero-cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = ctaButton.getAttribute('href');
            if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Add event listeners to clear sample selection when user edits content
    const resumeTextarea = getElement<HTMLTextAreaElement>('resume');
    const jobTextarea = getElement<HTMLTextAreaElement>('jobDescription');

    if (resumeTextarea) {
        resumeTextarea.addEventListener('input', () => {
            clearSampleSelection('resume');
        });
    }

    if (jobTextarea) {
        jobTextarea.addEventListener('input', () => {
            clearSampleSelection('job');
        });
    }

    // Setup predict button
    const predictBtn = getElement<HTMLButtonElement>('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', async () => {
            const resumeTextarea = getElement<HTMLTextAreaElement>('resume');
            const jobTextarea = getElement<HTMLTextAreaElement>('jobDescription');

            const resume = resumeTextarea?.value || '';
            const job = jobTextarea?.value || '';

            if (!resume || !job) {
                showError('Please provide both a resume and a job description.');
                return;
            }



            predictBtn.disabled = true;

            const loadingOverlay = getElement<HTMLElement>('loadingOverlay');
            if (loadingOverlay) {
                resetProgress();
                loadingOverlay.classList.add('show');
            }

            // Wait for modal to be visible before starting progress
            await new Promise(resolve => setTimeout(resolve, 50));

            startProgressSimulation();

            // CRITICAL FIX: Yield to event loop before starting heavy computation
            // This allows the progress animation to start running before ML inference blocks
            await new Promise(resolve => setTimeout(resolve, 200));

            const result = await predictAtsScore(resume, job);

            if (result) {
                completeProgress();

                // Keep modal visible for 800ms to show 100%
                await new Promise(resolve => setTimeout(resolve, 800));

                if (loadingOverlay) {
                    loadingOverlay.classList.remove('show');
                }
                setScore(result);
            } else {
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('show');
                }
            }

            predictBtn.disabled = false;
        });
    }

    // Setup global event delegation for better performance
    setupGlobalEventDelegation();
};

const setupGlobalEventDelegation = (): void => {
    document.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;

        // Handle mobile menu button
        if (target.id === 'mobileMenuBtn' || target.closest('#mobileMenuBtn')) {
            toggleMobileMenu();
        }

        // Handle main input tabs with data-target
        if (target.classList.contains('main-input-tab') && target.getAttribute('data-target')) {
            const viewId = target.getAttribute('data-target')!;
            switchInputView(viewId, target);
        }

        // Handle inner tabs with data-section and data-type
        if (target.classList.contains('input-tab') && target.getAttribute('data-section')) {
            const section = target.getAttribute('data-section')! as any;
            const type = target.getAttribute('data-type')! as any;
            switchTab(section, type);
        }

        // Handle sample buttons
        if (target.classList.contains('sample-button')) {
            const category = target.getAttribute('data-category')! as any;
            const type = target.getAttribute('data-type')! as any;
            if (type === 'resume') {
                loadSampleResume(category, updateCharCounter);
            } else if (type === 'job') {
                loadSampleJob(category, updateCharCounter);
            }
        }

        // Handle FAQ questions
        if (target.classList.contains('faq-question')) {
            console.log('FAQ question clicked:', target);
            toggleFAQ(target);
        } else if (target.classList.contains('faq-item') || target.closest('.faq-item')) {
            const faqItem = target.classList.contains('faq-item') ? target : target.closest('.faq-item')!;
            const faqButton = faqItem.querySelector('.faq-question') as HTMLElement;
            if (faqButton) {
                console.log('FAQ item clicked, targeting button:', faqButton);
                toggleFAQ(faqButton);
            }
        }

        // Handle modal triggers with data-modal
        if (target.hasAttribute('data-modal')) {
            e.preventDefault();
            const modalType = target.getAttribute('data-modal')! as any;

            // Special case: model-architecture uses custom modal
            if (modalType === 'model-architecture') {
                showModelDetailsModal();
            } else {
                openModal(modalType);
            }
        }

        // Handle model toggle button (top-right)
        if (target.classList.contains('model-toggle-compact') || target.closest('.model-toggle-compact')) {
            e.preventDefault();
            showModelDetailsModal();
        }

        // Handle model info icon button (in results)
        if (target.classList.contains('model-info-icon-btn') || target.closest('.model-info-icon-btn')) {
            e.preventDefault();
            showModelDetailsModal();
        }
    });
};

// Handle responsive behavior
window.addEventListener('resize', debounce(() => {
    // Hide mobile status if switched to desktop view
    if (!isMobileDevice() && appState.mobileStatus.isVisible) {
        appState.mobileStatus.hide();
    }
}, 150));

// Handle status card visibility on scroll (hide when leaving hero section)
window.addEventListener('scroll', debounce(() => {
    const statusCard = document.querySelector('.consolidated-status-card') as HTMLElement;
    if (!statusCard) return;

    const heroSection = document.querySelector('.hero') as HTMLElement;
    if (!heroSection) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const scrollPosition = window.scrollY + 100; // Add 100px buffer

    // Hide status card when scrolled past hero section
    if (scrollPosition > heroBottom) {
        statusCard.style.opacity = '0';
        statusCard.style.pointerEvents = 'none';
    } else {
        statusCard.style.opacity = '1';
        statusCard.style.pointerEvents = 'auto';
    }
}, 50));

// Clean up worker on page unload
window.addEventListener('beforeunload', () => {
    if (appState.atsWorker) {
        appState.atsWorker.dispose();
    }
});

// ===== APPLICATION STARTUP =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile optimizations first
    initializeMobileOptimizations();

    // Setup all event listeners
    setupEventListeners();

    // Set current year in footer copyright
    const copyrightYearElement = document.getElementById('copyrightYear');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear().toString();
    }

    // Initialize model info with loading state
    const modelSpecsElement = getElement<HTMLElement>('modelSpecsCompact');
    if (modelSpecsElement) {
        modelSpecsElement.textContent = 'Loading • 58MB • Local';
    }

    // Add small delay to ensure transformers module script has time to load
    setTimeout(() => {
        initialize();
    }, 100);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
});

// Export for testing purposes
export {
    initialize,
    predictAtsScore,
    setScore,
    updateOverviewTab,
    showModelInfo,
    setupEventListeners,
    ATS_CONFIG,
    appState
};