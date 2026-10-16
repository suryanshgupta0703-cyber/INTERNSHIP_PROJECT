/**
 * Analysis UI Components
 * Handles progress tracking, results display, and model information
 */

import { getElement } from '../utils/dom.ts';
import { showSuccess, showError } from './alerts.ts';
import type { ATSAnalysisResult } from '../types';

const SKILL_CHIP_LIMIT = 18;
let lastAnalysisResult: ATSAnalysisResult | null = null;

interface ProgressStep {
    percent: number;
    message: string;
}

const PROGRESS_STEPS: Record<string, ProgressStep> = {
    'Starting analysis': { percent: 15, message: 'Initializing analysis pipeline...' },
    'Processing resume input': { percent: 30, message: 'Parsing resume content...' },
    'Processing job description input': { percent: 45, message: 'Analyzing job requirements...' },
    'Processing with AI models': { percent: 70, message: 'Running neural network models...' },
    'Calculating final score': { percent: 90, message: 'Computing compatibility score...' }
};

let progressInterval: number | null = null;
let currentProgress = 0;

export const startProgressSimulation = (): void => {
    const progressBar = getElement<HTMLElement>('loadingProgress');
    const percentText = getElement<HTMLElement>('loadingPercent');
    const messageText = getElement<HTMLElement>('loadingMessage');

    if (!progressBar || !percentText) return;

    currentProgress = 0;

    if (progressInterval) {
        clearInterval(progressInterval);
    }

    // Set initial state immediately
    progressBar.style.width = '0%';
    percentText.textContent = '0%';
    if (messageText) {
        messageText.textContent = 'Your resume is being analyzed privately in your browser...';
    }

    progressInterval = window.setInterval(() => {
        if (currentProgress < 12) {
            const increment = Math.random() * 1.5 + 0.5;
            currentProgress = Math.min(currentProgress + increment, 12);

            progressBar.style.width = `${currentProgress}%`;
            percentText.textContent = `${Math.floor(currentProgress)}%`;
        }
    }, 100);
};

export const updateAnalysisProgress = (statusMessage: string): void => {
    const progressBar = getElement<HTMLElement>('loadingProgress');
    const percentText = getElement<HTMLElement>('loadingPercent');
    const messageText = getElement<HTMLElement>('loadingMessage');

    if (!progressBar || !percentText) return;

    for (const [key, { percent, message }] of Object.entries(PROGRESS_STEPS)) {
        if (statusMessage.includes(key)) {
            // Stop the simulation interval since we have real progress
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }

            currentProgress = percent;
            progressBar.style.width = `${percent}%`;
            percentText.textContent = `${percent}%`;
            if (messageText) {
                messageText.textContent = message;
            }
            break;
        }
    }
};

export const completeProgress = (): void => {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    const progressBar = getElement<HTMLElement>('loadingProgress');
    const percentText = getElement<HTMLElement>('loadingPercent');
    const messageText = getElement<HTMLElement>('loadingMessage');

    if (progressBar && percentText) {
        progressBar.style.width = '100%';
        percentText.textContent = '100%';
        if (messageText) {
            messageText.textContent = 'Analysis complete!';
        }
    }
};

export const resetProgress = (): void => {
    const progressBar = getElement<HTMLElement>('loadingProgress');
    const percentText = getElement<HTMLElement>('loadingPercent');
    const messageText = getElement<HTMLElement>('loadingMessage');

    if (progressBar) progressBar.style.width = '0%';
    if (percentText) percentText.textContent = '0%';
    if (messageText) messageText.textContent = 'Your resume is being analyzed privately in your browser...';
};

export const showModelDetailsModal = (): void => {
    const existingModal = document.querySelector('.model-details-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'model-details-overlay';
    overlay.innerHTML = `
        <div class="model-details-backdrop"></div>
        <div class="model-details-content">
            <div class="model-details-modal">
                <div class="model-details-header">
                    <h3 class="model-details-title">AI Model Architecture</h3>
                    <button class="model-details-close-btn" aria-label="Close modal" type="button">
                        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24" width="20">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="model-list">
                    <div class="model-item">
                        <div class="model-item-header">
                            <span class="model-item-name">Semantic Model</span>
                            <span class="model-item-size">29MB</span>
                        </div>
                        <div class="model-item-description">
                            Custom semantic embeddings fine-tuned for semantic similarity
                        </div>
                    </div>
                    <div class="model-item">
                        <div class="model-item-header">
                            <span class="model-item-name">Domain Model</span>
                            <span class="model-item-size">28MB</span>
                        </div>
                        <div class="model-item-description">
                            Custom contrastive learning model for domain classification
                        </div>
                    </div>
                    <div class="model-item">
                        <div class="model-item-header">
                            <span class="model-item-name">Ensemble Scorer</span>
                            <span class="model-item-size">0.5MB</span>
                        </div>
                        <div class="model-item-description">
                            <strong>ONNX Ridge + Neural</strong> - Polynomial features with dynamic ensemble scoring
                        </div>
                    </div>
                </div>
                <div class="model-total">
                    <span>Total Model Size:</span>
                    <span class="model-total-size">58MB</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const backdrop = overlay.querySelector('.model-details-backdrop');
    const closeBtn = overlay.querySelector('.model-details-close-btn');

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    backdrop?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    }, { once: true });

    setTimeout(() => overlay.classList.add('active'), 10);
};

export const renderSkillMatchMap = (result: ATSAnalysisResult): void => {
    lastAnalysisResult = result;
    const container = getElement<HTMLElement>('skillAnalysis');
    if (!container) return;

    const skillMatch = result.skillMatch;
    const matched = skillMatch?.matched ?? [];
    const missing = skillMatch?.missing ?? [];
    const jobCount = skillMatch?.jobSkills.length ?? 0;
    const foundCount = matched.length;
    const cover = jobCount > 0 ? Math.round((foundCount / jobCount) * 100) : 0;

    container.innerHTML = `
        <div class="skill-match-header">
            <h4 class="skill-match-title">Skill Match Map</h4>
            <p class="skill-match-meta">${foundCount} of ${jobCount} job skills found on your resume (${cover}%)</p>
        </div>
        <div class="skill-analysis-grid">
            <div class="skill-list-container">
                <div class="skill-list-title">Matched</div>
                ${renderSkillChips(matched, 'highlight')}
            </div>
            <div class="skill-list-container">
                <div class="skill-list-title">Missing from resume</div>
                ${renderSkillChips(missing, 'missing')}
            </div>
        </div>
        <div class="skill-match-actions">
            <button type="button" class="btn skill-action-btn" id="copyMissingSkillsBtn"${missing.length ? '' : ' disabled'}>
                Copy missing skills
            </button>
            <button type="button" class="btn skill-action-btn skill-action-btn-primary" id="copyScoreCardBtn">
                Copy score card
            </button>
        </div>
    `;

    getElement<HTMLButtonElement>('copyMissingSkillsBtn')?.addEventListener('click', () => {
        void copyText(formatMissingSkills(result), 'Missing skills copied');
    });
    getElement<HTMLButtonElement>('copyScoreCardBtn')?.addEventListener('click', () => {
        void copyText(formatScoreCard(result), 'Score card copied');
    });
};

function renderSkillChips(skills: string[], variant: 'highlight' | 'missing'): string {
    if (skills.length === 0) {
        return '<p class="skill-empty">None detected</p>';
    }

    const visible = skills.slice(0, SKILL_CHIP_LIMIT);
    const extra = skills.length - visible.length;
    const chips = visible
        .map(skill => `<span class="skill-item ${variant}">${escapeHtml(skill)}</span>`)
        .join('');
    const more = extra > 0 ? `<span class="skill-item skill-more">+${extra} more</span>` : '';
    return `<div class="skill-chip-row">${chips}${more}</div>`;
}

function formatMissingSkills(result: ATSAnalysisResult): string {
    const missing = result.skillMatch?.missing ?? [];
    return missing.length ? missing.join(', ') : 'No missing skills detected.';
}

function formatScoreCard(result: ATSAnalysisResult): string {
    const label = result.overallScore >= 80 ? 'Strong match'
        : result.overallScore >= 70 ? 'Good match'
        : result.overallScore >= 50 ? 'Fair match'
        : 'Needs work';
    const matched = result.skillMatch?.matched ?? [];
    const missing = result.skillMatch?.missing ?? [];

    return [
        `ATS Resume Analyzer — ${result.overallScore}/100 (${label})`,
        `Semantic similarity: ${result.breakdown.semanticMatch.score.toFixed(1)}%`,
        `Domain compatibility: ${Math.round(result.domainCompatibility ?? 0)}%`,
        `Skill depth: ${Math.round(result.skillDepth ?? 0)}%`,
        matched.length ? `Matched skills: ${matched.slice(0, 12).join(', ')}` : 'Matched skills: none detected',
        missing.length ? `Missing skills: ${missing.slice(0, 12).join(', ')}` : 'Missing skills: none detected',
        'Generated locally in your browser. No resume data left this device.'
    ].join('\n');
}

async function copyText(text: string, successMessage: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess(successMessage);
    } catch {
        showError('Could not copy to clipboard');
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export default {
    startProgressSimulation,
    updateAnalysisProgress,
    completeProgress,
    resetProgress,
    showModelDetailsModal,
    renderSkillMatchMap
};
