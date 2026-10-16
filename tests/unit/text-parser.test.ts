import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntelligentTextParser } from '../../src/core/text-parser';
import * as pdfjsLib from 'pdfjs-dist';

describe('IntelligentTextParser', () => {
  let parser: IntelligentTextParser;

  beforeEach(() => {
    parser = new IntelligentTextParser();
  });

  describe('parseText', () => {
    it('should extract sections and remove noise from text input', () => {
      const mockResume = `
        John Doe
        john@email.com
        (123) 456-7890
        linkedin.com/in/johndoe

        SUMMARY
        Software engineer with 5 years experience in React and Node.js.

        SKILLS
        JavaScript, Python, React, Node.js, AWS, Docker.

        EXPERIENCE
        Senior Developer at TechCorp (2020-Present)
        - Led development of new features.

        EDUCATION
        B.S. in Computer Science from University of Example.
      `;

      const result = parser.parseText(mockResume);

      // Should remove contact information
      expect(result.prioritizedText).not.toContain('john@email.com');
      expect(result.prioritizedText).not.toContain('(123) 456-7890');
      expect(result.prioritizedText).not.toContain('linkedin.com/in/johndoe');

      // Should preserve important content
      expect(result.prioritizedText).toContain('React');
      expect(result.prioritizedText).toContain('Senior Developer at TechCorp');
      expect(result.prioritizedText).toContain('JavaScript');
      expect(result.prioritizedText).toContain('Python');
    });

    it('should prioritize sections correctly', () => {
      const mockResume = `
        EDUCATION
        B.S. in Computer Science

        SUMMARY
        Experienced developer

        SKILLS
        JavaScript, React

        EXPERIENCE
        Senior Engineer at TechCorp
      `;

      const result = parser.parseText(mockResume).prioritizedText;

      // Skills should come before experience, which should come before summary, etc.
      const skillsIndex = result.indexOf('JavaScript');
      const experienceIndex = result.indexOf('Senior Engineer');
      const summaryIndex = result.indexOf('Experienced');
      const educationIndex = result.indexOf('Computer Science');

      // Verify content is present
      expect(skillsIndex).toBeGreaterThanOrEqual(0);
      expect(experienceIndex).toBeGreaterThanOrEqual(0);
      expect(educationIndex).toBeGreaterThanOrEqual(0);

      // Check correct prioritization order (skills should come first)
      expect(skillsIndex).toBeLessThan(experienceIndex);
      expect(experienceIndex).toBeLessThan(educationIndex);
    });

    it('should handle empty input gracefully', () => {
      const result = parser.parseText('');
      expect(result.prioritizedText).toBe('');
    });

    it('should handle minimal input', () => {
      const minimalText = 'Software Engineer with React experience';
      const result = parser.parseText(minimalText);

      expect(result.prioritizedText).toContain('React');
      expect(result.prioritizedText.length).toBeGreaterThan(0);
    });

    it('should remove URLs and social media links', () => {
      const textWithUrls = `
        SUMMARY
        Developer with experience

        Contact: https://website.com
        GitHub: github.com/username
        LinkedIn: linkedin.com/in/username
      `;

      const result = parser.parseText(textWithUrls).prioritizedText;

      expect(result).not.toContain('https://website.com');
      expect(result).not.toContain('github.com/username');
      expect(result).not.toContain('linkedin.com/in/username');
      expect(result).toContain('Developer with experience');
    });

    it('should handle job description parsing', () => {
      const jobDescription = `
        Senior Software Engineer Position
        contact@company.com

        We are looking for an experienced software engineer.

        REQUIREMENTS
        - 3+ years of JavaScript experience
        - React and Node.js proficiency
        - AWS cloud experience

        RESPONSIBILITIES
        - Design and implement new features
        - Collaborate with cross-functional teams
      `;

      const result = parser.parseText(jobDescription).prioritizedText;

      expect(result).not.toContain('contact@company.com');
      expect(result).toContain('JavaScript');
      expect(result).toContain('React');
      expect(result).toContain('AWS');
    });

    it('should truncate content to token limits', () => {
      // Create a very long text that would exceed token limits
      const longText = 'SKILLS\n' + 'JavaScript '.repeat(1000);
      const result = parser.parseText(longText).prioritizedText;

      // Should be truncated and end with '...'
      expect(result.length).toBeLessThan(longText.length);

      // Estimate tokens (rough calculation)
      const estimatedTokens = result.split(/\s+/).length * 1.3;
      expect(estimatedTokens).toBeLessThanOrEqual(500); // Should be within reasonable limits
    });
  });

  describe('parseFile', () => {
    it('should handle text file input', async () => {
      const mockTxtFile = new File(
        ['SUMMARY\nSoftware Engineer\nSKILLS\nJava, Python'],
        'resume.txt',
        { type: 'text/plain' }
      );

      const result = await parser.parseFile(mockTxtFile);

      expect(result.prioritizedText).toContain('Java');
      expect(result.prioritizedText).toContain('Python');
      expect(result.prioritizedText).toContain('Software Engineer');
    });

    it('should handle PDF file input (mocked)', async () => {
      const mockPdfFile = new File(['dummy pdf content'], 'resume.pdf', { type: 'application/pdf' });
      const mockPdfText = 'SKILLS: JavaScript, React. EXPERIENCE: Software Engineer at Google.';

      // Mock the getDocument method from the pdfjs-dist library
      vi.mocked(pdfjsLib.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: mockPdfText }],
            }),
          }),
        }),
      } as any);

      const result = await parser.parseFile(mockPdfFile);

      // Check that the text was extracted and processed
      expect(result.prioritizedText).toContain('JavaScript');
      expect(result.prioritizedText).toContain('React');
      expect(result.prioritizedText).toContain('Software Engineer');

      // Ensure the mock was called
      expect(pdfjsLib.getDocument).toHaveBeenCalled();
    });

    it('should handle unsupported file types', async () => {
      const mockFile = new File(['content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      await expect(parser.parseFile(mockFile)).rejects.toThrow('Unsupported file type');
    });
  });

  describe('section detection', () => {
    it('should detect various section header formats', () => {
      const textWithVariousSections = `
        CORE COMPETENCIES
        Leadership, Problem Solving

        TECHNICAL EXPERTISE
        Python, JavaScript

        PROFESSIONAL EXPERIENCE
        Software Engineer

        ACADEMIC BACKGROUND
        M.S. Computer Science

        KEY PROJECTS
        E-commerce Platform

        ACCOMPLISHMENTS
        Published research paper
      `;

      const result = parser.parseText(textWithVariousSections).prioritizedText;

      expect(result).toContain('Leadership');
      expect(result).toContain('Python');
      expect(result).toContain('Software Engineer');
      expect(result).toContain('Computer Science');
      expect(result).toContain('E-commerce Platform');
      expect(result).toContain('Published research paper');
    });

    it('should handle case variations in section headers', () => {
      const textWithCaseVariations = `
        skills
        React, Node.js

        Experience
        Senior Developer

        EDUCATION
        Bachelor's Degree
      `;

      const result = parser.parseText(textWithCaseVariations).prioritizedText;

      expect(result).toContain('React');
      expect(result).toContain('Senior Developer');
      expect(result).toContain('Bachelor\'s Degree');
    });
  });

  describe('noise removal', () => {
    it('should remove phone numbers in various formats', () => {
      const textWithPhones = `
        Contact: (555) 123-4567
        Also: 555.123.4567
        Or: 555-123-4567
        International: +1 555 123 4567

        SKILLS
        JavaScript
      `;

      const result = parser.parseText(textWithPhones).prioritizedText;

      expect(result).not.toContain('(555) 123-4567');
      expect(result).not.toContain('555.123.4567');
      expect(result).not.toContain('555-123-4567');
      expect(result).toContain('JavaScript');
    });

    it('should remove email addresses', () => {
      const textWithEmails = `
        john.doe@company.com
        contact@example.org
        info@website.co.uk

        EXPERIENCE
        Software Engineer
      `;

      const result = parser.parseText(textWithEmails).prioritizedText;

      expect(result).not.toContain('john.doe@company.com');
      expect(result).not.toContain('contact@example.org');
      expect(result).not.toContain('info@website.co.uk');
      expect(result).toContain('Software Engineer');
    });
  });

  describe('content preservation', () => {
    it('should preserve technical terms and skills', () => {
      const technicalText = `
        SKILLS
        React.js, Node.js, TypeScript, AWS Lambda, Docker, Kubernetes
        MongoDB, PostgreSQL, Redis, GraphQL, REST APIs
        CI/CD, Jenkins, Git, Agile, Scrum
      `;

      const result = parser.parseText(technicalText).prioritizedText;

      expect(result).toContain('React.js');
      expect(result).toContain('TypeScript');
      expect(result).toContain('Kubernetes');
      expect(result).toContain('PostgreSQL');
      expect(result).toContain('GraphQL');
    });

    it('should preserve quantified achievements', () => {
      const achievementText = `
        EXPERIENCE
        - Improved performance by 40%
        - Reduced load time from 3.2s to 1.1s
        - Led team of 8 developers
        - Managed budget of $2.5M
      `;

      const result = parser.parseText(achievementText).prioritizedText;

      expect(result).toContain('40%');
      expect(result).toContain('3.2s to 1.1s');
      expect(result).toContain('8 developers');
      expect(result).toContain('$2.5M');
    });
  });
});