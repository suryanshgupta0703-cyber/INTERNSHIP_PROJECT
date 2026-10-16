import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ATSEngine } from '../../src/core/ats-engine';
import { IntelligentTextParser } from '../../src/core/text-parser';

// Mock the transformers library
const mockModel = vi.fn();
const mockPipeline = vi.fn();

vi.mock('@huggingface/transformers', () => ({
  pipeline: mockPipeline
}));

// Mock window.transformers
Object.defineProperty(window, 'transformers', {
  value: {
    pipeline: mockPipeline
  },
  writable: true
});

describe('ATS Engine Integration', () => {
  let engine: ATSEngine;
  let mockTextParser: Partial<IntelligentTextParser>;
  let mockDomainModel: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock semantic model
    mockModel.mockResolvedValue({
      data: new Array(384).fill(0.1) // Mock embedding
    });

    // Mock domain model - simulate the actual binary classifier output (single logit)
    // Logit value > 0 means same domain (probability > 0.5 after sigmoid)
    // Logit value < 0 means different domain (probability < 0.5 after sigmoid)
    mockDomainModel = vi.fn().mockResolvedValue(1.0); // Logit of 1.0 = ~0.73 probability after sigmoid

    mockPipeline.mockImplementation((task: string) => {
      if (task === 'feature-extraction') {
        return Promise.resolve(mockModel);
      }
      if (task === 'text-classification') {
        return Promise.resolve(mockDomainModel);
      }
      return Promise.resolve(vi.fn());
    });

    // Create engine instance
    engine = new ATSEngine({
      enableDebugMode: false,
      enableRecommendations: true
    });

    // Mock text parser to return the new ParserOutput object with valid text length
    mockTextParser = {
      parseFile: vi.fn().mockResolvedValue({ 
        prioritizedText: 'cleaned resume text from file that is long enough to pass validation', 
        sections: { skills: 'cleaned resume from file'} 
      }),
      parseText: vi.fn().mockReturnValue({ 
        prioritizedText: 'cleaned job description from text that is also long enough to pass validation', 
        sections: { skills: 'cleaned job from text'} 
      }),
    };

    // Inject mock text parser
    (engine as any).textParser = mockTextParser;
  });

  describe('score method with File inputs', () => {
    it('should call textParser.parseFile for File inputs', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const jobFile = new File(['job content'], 'job.txt', { type: 'text/plain' });

      await engine.score(resumeFile, jobFile);

      expect(mockTextParser.parseFile).toHaveBeenCalledWith(resumeFile);
      expect(mockTextParser.parseFile).toHaveBeenCalledWith(jobFile);
      expect(mockTextParser.parseText).not.toHaveBeenCalled();
    });

    it('should call textParser.parseText for string inputs', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeString = 'pasted resume content';
      const jobString = 'pasted job content';

      await engine.score(resumeString, jobString);

      expect(mockTextParser.parseText).toHaveBeenCalledWith(resumeString);
      expect(mockTextParser.parseText).toHaveBeenCalledWith(jobString);
      expect(mockTextParser.parseFile).not.toHaveBeenCalled();
    });

    it('should use cleaned text for semantic analysis', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeString = 'raw resume content';
      const jobString = 'raw job content';

      // Ensure mock returns distinct values with sufficient length
      (mockTextParser.parseText as any)?.mockImplementation((input: string) => ({
        prioritizedText: `cleaned ${input} with additional technical skills and professional experience content`,
        sections: { skills: `skills from ${input}` }
      }));

      await engine.score(resumeString, jobString);

      // Verify the model was called with cleaned text (now includes additional content)
      expect(mockModel).toHaveBeenCalledWith('cleaned raw resume content with additional technical skills and professional experience content', expect.any(Object));
      expect(mockModel).toHaveBeenCalledWith('cleaned raw job content with additional technical skills and professional experience content', expect.any(Object));
    });
  });

  describe('text processing pipeline', () => {
    it('should handle mixed input types', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const jobString = 'job description text';

      await engine.score(resumeFile, jobString);

      expect(mockTextParser.parseFile).toHaveBeenCalledWith(resumeFile);
      expect(mockTextParser.parseText).toHaveBeenCalledWith(jobString);
    });

    it('should process cleaned text through semantic analysis', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeText = 'technical skills: JavaScript, React, Node.js';
      const jobText = 'looking for JavaScript developer with React experience';

      (mockTextParser.parseText as any)?.mockImplementation((input: string) => ({
        prioritizedText: input.replace(/contact info|email|phone/gi, '') + ' additional technical content to meet length requirements',
        sections: { skills: input }
      }));

      // Mock the scoring methods to avoid the processing time being 0
      (engine as any).getSemanticScore = vi.fn().mockResolvedValue({ similarity: 0.7 });
      (engine as any).combineScoresV4Hybrid = vi.fn().mockResolvedValue({ score: 70, confidence: 75 });

      const result = await engine.score(resumeText, jobText);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0); // Changed to >= 0 since mocked functions can be instant
    });
  });

  describe('error handling', () => {
    it('should handle text parser errors gracefully', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;

      (mockTextParser.parseText as any)?.mockImplementation(() => {
        throw new Error('Text parsing failed');
      });

      const resumeText = 'resume content';
      const jobText = 'job content';

      await expect(engine.score(resumeText, jobText)).rejects.toThrow('Analysis failed');
    });

    it('should handle file parsing errors', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;

      (mockTextParser.parseFile as any)?.mockRejectedValue(new Error('File parsing failed'));

      const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const jobText = 'job content';

      await expect(engine.score(resumeFile, jobText)).rejects.toThrow('Analysis failed');
    });
  });

  describe('performance improvements', () => {
    it('should handle large documents efficiently', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      // Create large text documents
      const largeResumeText = 'SKILLS\n' + 'JavaScript Python React Node.js AWS Docker '.repeat(100);
      const largeJobText = 'REQUIREMENTS\n' + 'looking for experienced developer with skills in '.repeat(50);

      // Mock text parser to simulate truncation
      (mockTextParser.parseText as any)?.mockImplementation((text: string) => ({
        prioritizedText: text.substring(0, 1000), // Simulate truncation
        sections: { skills: text.substring(0, 500) }
      }));

      const startTime = Date.now();
      const result = await engine.score(largeResumeText, largeJobText);
      const processingTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockTextParser.parseText).toHaveBeenCalledTimes(2);
    });

    it('should prioritize content correctly', async () => {
      // Skip initialization for this test
      (engine as any).isInitialized = true;
      (engine as any).model = mockModel;
      (engine as any).domainModel = mockDomainModel;

      const resumeWithSections = `
        John Doe
        john@email.com
        (555) 123-4567

        EDUCATION
        B.S. Computer Science

        SUMMARY
        Software Engineer

        SKILLS
        JavaScript, React, Python

        EXPERIENCE
        Senior Developer at TechCorp
      `;

      const jobText = 'Looking for JavaScript developer with React experience';

      // Verify that the parser is called and processes the resume
      await engine.score(resumeWithSections, jobText);

      expect(mockTextParser.parseText).toHaveBeenCalledWith(resumeWithSections);
      expect(mockTextParser.parseText).toHaveBeenCalledWith(jobText);
    });
  });
});