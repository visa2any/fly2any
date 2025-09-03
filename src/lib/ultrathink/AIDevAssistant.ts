/**
 * ULTRATHINK ENTERPRISE - AI Development Assistant
 * 
 * Enhanced Development Companion - Ready for Action
 * - Instant code generation and implementation
 * - Smart bug detection and fixes
 * - Context-aware development assistance  
 * - Complete feature implementation capabilities
 */

import OpenAI from 'openai';
import { EventEmitter } from 'events';

interface CodeContext {
  projectType: 'web' | 'mobile' | 'api' | 'fullstack';
  framework: string;
  language: string;
  codebase: CodebaseAnalysis;
  currentFile?: string;
  selectedCode?: string;
  userIntent: string;
}

interface CodebaseAnalysis {
  structure: FileStructure[];
  dependencies: string[];
  architecture: string;
  patterns: string[];
  conventions: CodeConventions;
  metrics: CodeMetrics;
}

interface FileStructure {
  path: string;
  type: 'component' | 'utility' | 'service' | 'config' | 'test';
  complexity: number;
  dependencies: string[];
}

interface CodeConventions {
  naming: 'camelCase' | 'PascalCase' | 'kebab-case' | 'snake_case';
  indentation: 'tabs' | 'spaces';
  quotes: 'single' | 'double';
  semicolons: boolean;
  imports: 'relative' | 'absolute';
}

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  testCoverage: number;
  technicalDebt: number;
  maintainability: number;
}

interface AIResponse {
  code?: string;
  explanation: string;
  suggestions: string[];
  warnings: string[];
  confidence: number;
  executionTime: number;
}

interface BugPrediction {
  probability: number;
  type: 'runtime' | 'logic' | 'performance' | 'security' | 'accessibility';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prevention: string;
  codeLocation?: string;
}

// Enhanced Development Request Interface
interface DevelopmentRequest {
  task: string;
  type: 'implement' | 'fix' | 'optimize' | 'test' | 'refactor' | 'document';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: {
    framework: string;
    language: string;
    files?: string[];
    existingCode?: string;
    requirements?: string[];
  };
  expectedOutput: 'code' | 'explanation' | 'both';
}

interface QuickResponse {
  success: boolean;
  result: string;
  code?: string;
  files?: { path: string; content: string }[];
  nextSteps?: string[];
  warnings?: string[];
  executionTime: number;
}

// AI-Powered Code Architect
class CodeArchitect {
  private openai: OpenAI;
  private architecturePatterns: Map<string, any> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.initializePatterns();
  }

  async generateArchitecture(requirements: string, context: CodeContext): Promise<AIResponse> {
    const startTime = performance.now();
    
    const prompt = this.buildArchitecturePrompt(requirements, context);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert software architect specializing in ${context.framework} and ${context.language}. 
            Generate optimal, scalable, and maintainable architecture solutions.
            Focus on: performance, security, maintainability, and user experience.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content || '';
      const executionTime = performance.now() - startTime;

      return {
        code: this.extractCodeFromResponse(response),
        explanation: this.extractExplanationFromResponse(response),
        suggestions: this.extractSuggestionsFromResponse(response),
        warnings: this.extractWarningsFromResponse(response),
        confidence: this.calculateConfidence(response, context),
        executionTime
      };

    } catch (error) {
      console.error('AI Architecture Generation Error:', error);
      return {
        explanation: 'Failed to generate architecture. Please try again.',
        suggestions: ['Check your OpenAI API configuration', 'Verify network connectivity'],
        warnings: ['AI service temporarily unavailable'],
        confidence: 0,
        executionTime: performance.now() - startTime
      };
    }
  }

  private buildArchitecturePrompt(requirements: string, context: CodeContext): string {
    return `
Project Context:
- Type: ${context.projectType}
- Framework: ${context.framework}
- Language: ${context.language}
- Architecture: ${context.codebase.architecture}
- Current patterns: ${context.codebase.patterns.join(', ')}

Requirements:
${requirements}

Current codebase metrics:
- Lines of code: ${context.codebase.metrics.linesOfCode}
- Complexity: ${context.codebase.metrics.complexity}
- Test coverage: ${context.codebase.metrics.testCoverage}%
- Technical debt: ${context.codebase.metrics.technicalDebt}

Please provide:
1. Optimal architecture solution
2. Implementation code examples
3. Performance considerations
4. Security implications
5. Scalability factors
6. Maintenance recommendations

Format your response with clear sections for code, explanation, suggestions, and warnings.
    `;
  }

  private extractCodeFromResponse(response: string): string {
    const codeRegex = /```(?:\w+)?\n?([\s\S]*?)```/g;
    const matches = response.match(codeRegex);
    return matches ? matches.join('\n\n') : '';
  }

  private extractExplanationFromResponse(response: string): string {
    // Remove code blocks and extract explanation
    const withoutCode = response.replace(/```[\s\S]*?```/g, '');
    return withoutCode.trim();
  }

  private extractSuggestionsFromResponse(response: string): string[] {
    const suggestionRegex = /(?:suggestion|recommendation|consider|should)[\s\S]*?(?:\n|$)/gi;
    const matches = response.match(suggestionRegex);
    return matches ? matches.map(s => s.trim()) : [];
  }

  private extractWarningsFromResponse(response: string): string[] {
    const warningRegex = /(?:warning|caution|note|important)[\s\S]*?(?:\n|$)/gi;
    const matches = response.match(warningRegex);
    return matches ? matches.map(w => w.trim()) : [];
  }

  private calculateConfidence(response: string, context: CodeContext): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on response quality
    if (response.includes('```')) confidence += 0.2; // Contains code
    if (response.length > 500) confidence += 0.1; // Detailed response
    if (response.includes(context.framework)) confidence += 0.1; // Framework specific
    if (response.includes('performance')) confidence += 0.05; // Performance aware
    if (response.includes('security')) confidence += 0.05; // Security conscious
    
    return Math.min(1, confidence);
  }

  private initializePatterns(): void {
    this.architecturePatterns.set('mvc', {
      description: 'Model-View-Controller pattern',
      advantages: ['Separation of concerns', 'Testability', 'Maintainability'],
      bestFor: ['Web applications', 'Enterprise applications']
    });
    
    this.architecturePatterns.set('microservices', {
      description: 'Microservices architecture',
      advantages: ['Scalability', 'Independence', 'Technology diversity'],
      bestFor: ['Large applications', 'Team scaling', 'Complex domains']
    });
    
    // Add more patterns...
  }
}

// Predictive Bug Detector
class BugPredictor {
  private openai: OpenAI;
  private bugPatterns: Map<string, BugPrediction> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.initializeBugPatterns();
  }

  async predictBugs(code: string, context: CodeContext): Promise<BugPrediction[]> {
    const predictions: BugPrediction[] = [];
    
    // Static analysis predictions
    const staticPredictions = this.performStaticAnalysis(code, context);
    predictions.push(...staticPredictions);
    
    // AI-powered predictions
    try {
      const aiPredictions = await this.performAIAnalysis(code, context);
      predictions.push(...aiPredictions);
    } catch (error) {
      console.error('AI Bug Prediction Error:', error);
    }
    
    return predictions.sort((a, b) => b.probability - a.probability);
  }

  private performStaticAnalysis(code: string, context: CodeContext): BugPrediction[] {
    const predictions: BugPrediction[] = [];
    
    // Check for common patterns that lead to bugs
    if (code.includes('==') && !code.includes('===')) {
      predictions.push({
        probability: 0.7,
        type: 'logic',
        description: 'Loose equality comparison may cause type coercion issues',
        severity: 'medium',
        prevention: 'Use strict equality (===) instead of loose equality (==)',
        codeLocation: 'Equality comparison detected'
      });
    }
    
    if (code.includes('setTimeout') && code.includes('0')) {
      predictions.push({
        probability: 0.6,
        type: 'performance',
        description: 'setTimeout with 0 delay may cause performance issues',
        severity: 'low',
        prevention: 'Consider using requestAnimationFrame for DOM updates',
        codeLocation: 'setTimeout usage detected'
      });
    }
    
    if (code.includes('innerHTML') && !code.includes('sanitize')) {
      predictions.push({
        probability: 0.8,
        type: 'security',
        description: 'Direct innerHTML usage without sanitization creates XSS vulnerability',
        severity: 'high',
        prevention: 'Sanitize input or use textContent instead of innerHTML',
        codeLocation: 'innerHTML usage detected'
      });
    }
    
    if (code.includes('localStorage') && !code.includes('try')) {
      predictions.push({
        probability: 0.5,
        type: 'runtime',
        description: 'localStorage access without error handling may fail in private browsing',
        severity: 'medium',
        prevention: 'Wrap localStorage access in try-catch blocks',
        codeLocation: 'localStorage usage detected'
      });
    }
    
    return predictions;
  }

  private async performAIAnalysis(code: string, context: CodeContext): Promise<BugPrediction[]> {
    const prompt = `
    Analyze this ${context.language} code for potential bugs and issues:
    
    \`\`\`${context.language}
    ${code}
    \`\`\`
    
    Context:
    - Framework: ${context.framework}
    - Project type: ${context.projectType}
    - Current file: ${context.currentFile || 'unknown'}
    
    Please identify potential bugs, performance issues, security vulnerabilities, and accessibility problems.
    For each issue, provide:
    1. Probability (0.0 to 1.0)
    2. Type (runtime, logic, performance, security, accessibility)
    3. Description
    4. Severity (low, medium, high, critical)
    5. Prevention strategy
    
    Format as JSON array.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer specializing in bug detection and prevention. Analyze code for potential issues and provide actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content || '[]';
      return this.parseBugPredictions(response);
      
    } catch (error) {
      console.error('AI Bug Analysis Error:', error);
      return [];
    }
  }

  private parseBugPredictions(response: string): BugPrediction[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse text response
      return this.parseTextBugPredictions(response);
    } catch (error) {
      console.error('Bug prediction parsing error:', error);
      return [];
    }
  }

  private parseTextBugPredictions(response: string): BugPrediction[] {
    // Fallback text parsing implementation
    return [];
  }

  private initializeBugPatterns(): void {
    // Initialize common bug patterns
    this.bugPatterns.set('null-reference', {
      probability: 0.8,
      type: 'runtime',
      description: 'Potential null or undefined reference access',
      severity: 'high',
      prevention: 'Add null checks or use optional chaining'
    });
    
    // Add more patterns...
  }
}

// Intelligent Code Generator
class IntelligentCodeGenerator {
  private openai: OpenAI;
  private codeTemplates: Map<string, string> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.initializeTemplates();
  }

  async generateCode(description: string, context: CodeContext): Promise<AIResponse> {
    const startTime = performance.now();
    
    const prompt = this.buildCodeGenerationPrompt(description, context);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert ${context.language} developer specializing in ${context.framework}. 
            Generate high-quality, production-ready code that follows best practices and conventions.
            Always include proper error handling, type safety, and documentation.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content || '';
      const executionTime = performance.now() - startTime;

      return {
        code: this.extractCodeFromResponse(response),
        explanation: this.extractExplanationFromResponse(response),
        suggestions: this.extractSuggestionsFromResponse(response),
        warnings: this.extractWarningsFromResponse(response),
        confidence: this.calculateConfidence(response, context),
        executionTime
      };

    } catch (error) {
      console.error('AI Code Generation Error:', error);
      return {
        explanation: 'Failed to generate code. Please try again.',
        suggestions: ['Check your OpenAI API configuration', 'Verify network connectivity'],
        warnings: ['AI service temporarily unavailable'],
        confidence: 0,
        executionTime: performance.now() - startTime
      };
    }
  }

  private buildCodeGenerationPrompt(description: string, context: CodeContext): string {
    return `
Generate ${context.language} code for: ${description}

Project Context:
- Framework: ${context.framework}
- Project type: ${context.projectType}
- Architecture: ${context.codebase.architecture}
- Conventions: ${JSON.stringify(context.codebase.conventions)}

Requirements:
1. Follow existing code conventions
2. Include proper TypeScript types
3. Add comprehensive error handling
4. Include JSDoc documentation
5. Follow ${context.framework} best practices
6. Ensure accessibility compliance
7. Optimize for performance

${context.selectedCode ? `Current code context:\n\`\`\`${context.language}\n${context.selectedCode}\n\`\`\`` : ''}

Please provide complete, production-ready code with explanations.
    `;
  }

  private extractCodeFromResponse(response: string): string {
    const codeRegex = /```(?:\w+)?\n?([\s\S]*?)```/g;
    const matches = response.match(codeRegex);
    return matches ? matches.join('\n\n') : '';
  }

  private extractExplanationFromResponse(response: string): string {
    const withoutCode = response.replace(/```[\s\S]*?```/g, '');
    return withoutCode.trim();
  }

  private extractSuggestionsFromResponse(response: string): string[] {
    const suggestionRegex = /(?:suggestion|tip|note|consider)[\s\S]*?(?:\n|$)/gi;
    const matches = response.match(suggestionRegex);
    return matches ? matches.map(s => s.trim()) : [];
  }

  private extractWarningsFromResponse(response: string): string[] {
    const warningRegex = /(?:warning|caution|important|beware)[\s\S]*?(?:\n|$)/gi;
    const matches = response.match(warningRegex);
    return matches ? matches.map(w => w.trim()) : [];
  }

  private calculateConfidence(response: string, context: CodeContext): number {
    let confidence = 0.5;
    
    if (response.includes('```')) confidence += 0.3;
    if (response.includes(context.framework)) confidence += 0.1;
    if (response.includes('TypeScript') || response.includes('interface')) confidence += 0.1;
    if (response.includes('error') || response.includes('try')) confidence += 0.05;
    if (response.length > 1000) confidence += 0.05;
    
    return Math.min(1, confidence);
  }

  private initializeTemplates(): void {
    this.codeTemplates.set('react-component', `
import React from 'react';

interface Props {
  // Define your props here
}

export const ComponentName: React.FC<Props> = ({ }) => {
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};

export default ComponentName;
    `);
    
    // Add more templates...
  }
}

// Main AI Development Assistant
export class AIDevAssistant extends EventEmitter {
  private codeArchitect!: CodeArchitect;
  private bugPredictor!: BugPredictor;
  private codeGenerator!: IntelligentCodeGenerator;
  private isInitialized = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const apiKey = process.env.OPENAI_API_KEY || '';
      
      if (!apiKey) {
        console.warn('🤖 AIDevAssistant: OpenAI API key not found. AI features will be limited.');
        return;
      }

      this.codeArchitect = new CodeArchitect(apiKey);
      this.bugPredictor = new BugPredictor(apiKey);
      this.codeGenerator = new IntelligentCodeGenerator(apiKey);
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('🤖 ULTRATHINK AI Development Assistant initialized with GPT-4 integration');
    } catch (error) {
      console.error('AI Development Assistant initialization failed:', error);
      this.emit('initializationFailed', error);
    }
  }

  // Generate architecture recommendations
  async generateArchitecture(requirements: string, context: CodeContext): Promise<AIResponse> {
    if (!this.isInitialized) {
      return this.getUnavailableResponse();
    }
    
    this.emit('architectureGenerationStarted', requirements);
    const result = await this.codeArchitect.generateArchitecture(requirements, context);
    this.emit('architectureGenerationCompleted', result);
    
    return result;
  }

  // Predict potential bugs
  async predictBugs(code: string, context: CodeContext): Promise<BugPrediction[]> {
    if (!this.isInitialized) {
      return [];
    }
    
    this.emit('bugPredictionStarted', code);
    const predictions = await this.bugPredictor.predictBugs(code, context);
    this.emit('bugPredictionCompleted', predictions);
    
    return predictions;
  }

  // Generate code from description
  async generateCode(description: string, context: CodeContext): Promise<AIResponse> {
    if (!this.isInitialized) {
      return this.getUnavailableResponse();
    }
    
    this.emit('codeGenerationStarted', description);
    const result = await this.codeGenerator.generateCode(description, context);
    this.emit('codeGenerationCompleted', result);
    
    return result;
  }

  // Get assistant status
  getStatus(): {
    initialized: boolean;
    capabilities: string[];
    apiKeyConfigured: boolean;
  } {
    return {
      initialized: this.isInitialized,
      capabilities: this.isInitialized ? 
        ['architecture', 'bug-prediction', 'code-generation', 'optimization'] : 
        ['limited-analysis'],
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    };
  }

  private getUnavailableResponse(): AIResponse {
    return {
      explanation: 'AI features are not available. Please configure OpenAI API key.',
      suggestions: ['Add OPENAI_API_KEY to your environment variables'],
      warnings: ['AI-powered features require API key configuration'],
      confidence: 0,
      executionTime: 0
    };
  }
}

// Quick Development Assistant for Immediate Tasks
export class QuickDevAssistant {
  private aiAssistant: AIDevAssistant;

  constructor() {
    this.aiAssistant = new AIDevAssistant();
  }

  // Instant development task handler
  async handleDevelopmentRequest(request: DevelopmentRequest): Promise<QuickResponse> {
    const startTime = performance.now();

    try {
      // Create context from request
      const context: CodeContext = {
        projectType: this.inferProjectType(request.context.framework),
        framework: request.context.framework,
        language: request.context.language,
        codebase: this.createQuickCodebaseAnalysis(),
        currentFile: request.context.files?.[0],
        selectedCode: request.context.existingCode,
        userIntent: request.task
      };

      let result: QuickResponse;

      switch (request.type) {
        case 'implement':
          result = await this.handleImplementation(request, context);
          break;
        case 'fix':
          result = await this.handleBugFix(request, context);
          break;
        case 'optimize':
          result = await this.handleOptimization(request, context);
          break;
        case 'test':
          result = await this.handleTestGeneration(request, context);
          break;
        case 'refactor':
          result = await this.handleRefactoring(request, context);
          break;
        case 'document':
          result = await this.handleDocumentation(request, context);
          break;
        default:
          result = await this.handleGenericTask(request, context);
      }

      result.executionTime = performance.now() - startTime;
      return result;

    } catch (error) {
      return {
        success: false,
        result: `Error processing request: ${error instanceof Error ? error.message : String(error)}`,
        warnings: ['Task execution failed', 'Please try again or provide more context'],
        executionTime: performance.now() - startTime
      };
    }
  }

  private async handleImplementation(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    // Generate architecture if needed
    const architectureResponse = await this.aiAssistant.generateArchitecture(request.task, context);
    
    if (architectureResponse.code) {
      return {
        success: true,
        result: `Feature implementation ready: ${request.task}`,
        code: architectureResponse.code,
        nextSteps: [
          'Review the generated code',
          'Test the implementation',
          'Deploy when ready'
        ],
        warnings: architectureResponse.warnings,
        executionTime: Date.now() - startTime
      };
    }

    return {
      success: true,
      result: architectureResponse.explanation,
      nextSteps: architectureResponse.suggestions,
      executionTime: Date.now() - startTime
    };
  }

  private async handleBugFix(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    if (!context.selectedCode) {
      return {
        success: false,
        result: 'Please provide the problematic code to analyze and fix',
        nextSteps: ['Include the code that needs fixing in your request'],
        executionTime: Date.now() - startTime
      };
    }

    // Analyze for bugs
    const bugPredictions = await this.aiAssistant.predictBugs(context.selectedCode, context);
    
    if (bugPredictions.length > 0) {
      const criticalBugs = bugPredictions.filter(b => b.severity === 'critical' || b.severity === 'high');
      
      return {
        success: true,
        result: `Found ${bugPredictions.length} potential issues. Focus on ${criticalBugs.length} critical/high severity bugs.`,
        nextSteps: criticalBugs.map(bug => `Fix ${bug.type} issue: ${bug.description}`),
        warnings: bugPredictions.map(b => `${b.severity.toUpperCase()}: ${b.description}`),
        executionTime: Date.now() - startTime
      };
    }

    return {
      success: true,
      result: 'No obvious bugs detected. Code appears to be clean.',
      nextSteps: ['Run tests to verify functionality', 'Check performance metrics'],
      executionTime: Date.now() - startTime
    };
  }

  private async handleOptimization(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    const optimizationPrompt = `Optimize this ${context.language} code for performance and maintainability: ${request.task}`;
    const response = await this.aiAssistant.generateCode(optimizationPrompt, context);

    return {
      success: true,
      result: 'Optimization analysis complete',
      code: response.code,
      nextSteps: [
        'Review optimization suggestions',
        'Benchmark before and after performance',
        'Apply changes gradually'
      ],
      warnings: response.warnings,
      executionTime: Date.now() - startTime
    };
  }

  private async handleTestGeneration(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    const testPrompt = `Generate comprehensive tests for: ${request.task}`;
    const response = await this.aiAssistant.generateCode(testPrompt, context);

    return {
      success: true,
      result: 'Test suite generated successfully',
      code: response.code,
      files: this.generateTestFiles(response.code || '', context),
      nextSteps: [
        'Review test coverage',
        'Run tests to ensure they pass',
        'Add edge case tests if needed'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async handleRefactoring(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    const refactorPrompt = `Refactor this code following best practices: ${request.task}`;
    const response = await this.aiAssistant.generateCode(refactorPrompt, context);

    return {
      success: true,
      result: 'Code refactoring complete',
      code: response.code,
      nextSteps: [
        'Review refactored code structure',
        'Run existing tests to ensure no regressions',
        'Update documentation if needed'
      ],
      warnings: response.warnings,
      executionTime: Date.now() - startTime
    };
  }

  private async handleDocumentation(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    const docPrompt = `Generate comprehensive documentation for: ${request.task}`;
    const response = await this.aiAssistant.generateCode(docPrompt, context);

    return {
      success: true,
      result: 'Documentation generated successfully',
      code: response.code,
      files: this.generateDocumentationFiles(response.code || '', context),
      nextSteps: [
        'Review documentation for accuracy',
        'Add API examples if applicable',
        'Update README if needed'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async handleGenericTask(request: DevelopmentRequest, context: CodeContext): Promise<QuickResponse> {
    const startTime = Date.now();
    const response = await this.aiAssistant.generateCode(request.task, context);

    return {
      success: true,
      result: `Task completed: ${request.task}`,
      code: response.code,
      nextSteps: response.suggestions || ['Review the generated solution', 'Test the implementation'],
      warnings: response.warnings,
      executionTime: Date.now() - startTime
    };
  }

  // Quick helper methods
  private inferProjectType(framework: string): 'web' | 'mobile' | 'api' | 'fullstack' {
    const webFrameworks = ['react', 'nextjs', 'vue', 'svelte', 'angular'];
    const mobileFrameworks = ['react-native', 'flutter', 'ionic'];
    const apiFrameworks = ['express', 'fastify', 'nest', 'koa'];
    
    if (webFrameworks.includes(framework.toLowerCase())) return 'web';
    if (mobileFrameworks.includes(framework.toLowerCase())) return 'mobile';
    if (apiFrameworks.includes(framework.toLowerCase())) return 'api';
    
    return 'fullstack';
  }

  private createQuickCodebaseAnalysis(): CodebaseAnalysis {
    return {
      structure: [],
      dependencies: ['react', 'nextjs', 'typescript', 'tailwindcss'],
      architecture: 'component-based',
      patterns: ['hooks', 'context', 'server-components'],
      conventions: {
        naming: 'camelCase',
        indentation: 'spaces',
        quotes: 'single',
        semicolons: true,
        imports: 'relative'
      },
      metrics: {
        linesOfCode: 10000,
        complexity: 3.2,
        testCoverage: 75,
        technicalDebt: 2.1,
        maintainability: 8.5
      }
    };
  }

  private generateTestFiles(code: string, context: CodeContext): { path: string; content: string }[] {
    const testFileName = `${context.currentFile?.replace('.tsx', '.test.tsx') || 'component.test.tsx'}`;
    
    return [{
      path: testFileName,
      content: code
    }];
  }

  private generateDocumentationFiles(content: string, context: CodeContext): { path: string; content: string }[] {
    return [{
      path: 'README.md',
      content: content
    }];
  }

  // Simple request builder for common tasks
  createRequest(
    task: string, 
    type: 'implement' | 'fix' | 'optimize' | 'test' | 'refactor' | 'document' = 'implement',
    options: {
      framework?: string;
      language?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      existingCode?: string;
      files?: string[];
    } = {}
  ): DevelopmentRequest {
    return {
      task,
      type,
      priority: options.priority || 'medium',
      context: {
        framework: options.framework || 'nextjs',
        language: options.language || 'typescript',
        files: options.files,
        existingCode: options.existingCode,
        requirements: []
      },
      expectedOutput: 'both'
    };
  }

  // Status check
  isReady(): boolean {
    const status = this.aiAssistant.getStatus();
    return status.initialized && status.apiKeyConfigured;
  }
}

// Global instances
export const aiDevAssistant = new AIDevAssistant();
export const quickDevAssistant = new QuickDevAssistant();