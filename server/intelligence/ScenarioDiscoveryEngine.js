import { writeFileSync, readFileSync, existsSync } from 'fs';
import { URL } from 'url';

export class ScenarioDiscoveryEngine {
  constructor() {
    this.knowledgeBase = this.loadKnowledgeBase();
    this.patterns = this.initializePatterns();
    this.learningData = this.loadLearningData();
  }

  loadKnowledgeBase() {
    const kbPath = 'server/data/knowledge_base.json';
    if (existsSync(kbPath)) {
      try {
        return JSON.parse(readFileSync(kbPath, 'utf8'));
      } catch (error) {
        console.log('Creating new knowledge base');
      }
    }
    
    return {
      webPatterns: {
        ecommerce: {
          indicators: ['cart', 'shop', 'product', 'checkout', 'payment'],
          testScenarios: [
            'Add to cart workflow',
            'Checkout process validation',
            'Payment form testing',
            'Product search functionality',
            'User account management'
          ]
        },
        authentication: {
          indicators: ['login', 'register', 'auth', 'signin', 'signup'],
          testScenarios: [
            'Login form validation',
            'Registration process',
            'Password reset flow',
            'Session management',
            'Multi-factor authentication'
          ]
        },
        cms: {
          indicators: ['admin', 'dashboard', 'content', 'editor', 'publish'],
          testScenarios: [
            'Content creation workflow',
            'User permission testing',
            'File upload functionality',
            'Content publishing flow',
            'Search and filtering'
          ]
        },
        api: {
          indicators: ['api', 'rest', 'graphql', 'endpoint'],
          testScenarios: [
            'CRUD operations validation',
            'Authentication endpoints',
            'Rate limiting testing',
            'Error response validation',
            'Data serialization testing'
          ]
        }
      },
      formPatterns: {
        contact: ['name', 'email', 'message', 'phone'],
        registration: ['username', 'email', 'password', 'confirm'],
        payment: ['card', 'cvv', 'expiry', 'billing'],
        search: ['query', 'filter', 'sort', 'category']
      },
      uiPatterns: {
        navigation: ['nav', 'menu', 'breadcrumb', 'sidebar'],
        content: ['article', 'post', 'card', 'list'],
        interaction: ['button', 'link', 'modal', 'dropdown'],
        data: ['table', 'grid', 'chart', 'pagination']
      }
    };
  }

  initializePatterns() {
    return {
      urlPatterns: [
        { pattern: /\/api\//, type: 'api', weight: 0.9 },
        { pattern: /\/admin/, type: 'cms', weight: 0.8 },
        { pattern: /\/shop|\/store|\/cart/, type: 'ecommerce', weight: 0.9 },
        { pattern: /\/login|\/auth/, type: 'authentication', weight: 0.8 },
        { pattern: /\/dashboard/, type: 'cms', weight: 0.7 }
      ],
      elementPatterns: [
        { selector: 'form[action*="login"]', type: 'authentication', weight: 0.9 },
        { selector: '.cart, #cart, [class*="cart"]', type: 'ecommerce', weight: 0.8 },
        { selector: 'input[type="search"]', type: 'search', weight: 0.7 },
        { selector: '.pagination, .pager', type: 'data', weight: 0.6 }
      ]
    };
  }

  loadLearningData() {
    const learningPath = 'server/data/learning_data.json';
    if (existsSync(learningPath)) {
      try {
        return JSON.parse(readFileSync(learningPath, 'utf8'));
      } catch (error) {
        console.log('Creating new learning data');
      }
    }
    
    return {
      successfulScenarios: {},
      failurePatterns: {},
      performanceMetrics: {},
      adaptationHistory: []
    };
  }

  async analyzeWebsite(url, pageContent = null, apiEndpoints = []) {
    console.log(`[ScenarioEngine] Analyzing website: ${url}`);
    
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      detectedPatterns: [],
      recommendedScenarios: [],
      confidence: 0
    };

    // Analyze URL patterns
    const urlAnalysis = this.analyzeUrlPatterns(url);
    analysis.detectedPatterns.push(...urlAnalysis.patterns);

    // Analyze API endpoints if available
    if (apiEndpoints.length > 0) {
      const apiAnalysis = this.analyzeApiPatterns(apiEndpoints);
      analysis.detectedPatterns.push(...apiAnalysis.patterns);
    }

    // Generate scenarios based on detected patterns
    analysis.recommendedScenarios = this.generateScenarios(analysis.detectedPatterns);
    analysis.confidence = this.calculateConfidence(analysis.detectedPatterns);

    // Learn from this analysis
    this.updateLearningData(analysis);

    return analysis;
  }

  analyzeUrlPatterns(url) {
    const patterns = [];
    const urlObj = new URL(url);
    const fullPath = urlObj.pathname + urlObj.search;

    for (const pattern of this.patterns.urlPatterns) {
      if (pattern.pattern.test(fullPath)) {
        patterns.push({
          type: pattern.type,
          source: 'url',
          confidence: pattern.weight,
          evidence: fullPath
        });
      }
    }

    return { patterns };
  }

  analyzeApiPatterns(endpoints) {
    const patterns = [];
    const endpointTypes = new Set();

    for (const endpoint of endpoints) {
      const path = endpoint.url || endpoint;
      
      // Detect CRUD patterns
      if (path.includes('/users') || path.includes('/user')) {
        endpointTypes.add('user_management');
      }
      if (path.includes('/products') || path.includes('/items')) {
        endpointTypes.add('catalog_management');
      }
      if (path.includes('/orders') || path.includes('/cart')) {
        endpointTypes.add('ecommerce');
      }
      if (path.includes('/auth') || path.includes('/login')) {
        endpointTypes.add('authentication');
      }
    }

    for (const type of endpointTypes) {
      patterns.push({
        type,
        source: 'api',
        confidence: 0.8,
        evidence: `API endpoints detected: ${type}`
      });
    }

    return { patterns };
  }

  generateScenarios(detectedPatterns) {
    const scenarios = [];
    const patternTypes = new Set(detectedPatterns.map(p => p.type));

    for (const patternType of patternTypes) {
      const knowledgePattern = this.knowledgeBase.webPatterns[patternType];
      if (knowledgePattern) {
        for (const scenario of knowledgePattern.testScenarios) {
          scenarios.push({
            name: scenario,
            type: patternType,
            priority: this.calculateScenarioPriority(scenario, detectedPatterns),
            estimatedComplexity: this.estimateComplexity(scenario),
            requiredAgents: this.determineRequiredAgents(scenario)
          });
        }
      }
    }

    // Add intelligent cross-pattern scenarios
    if (patternTypes.has('ecommerce') && patternTypes.has('authentication')) {
      scenarios.push({
        name: 'End-to-end purchase flow with authentication',
        type: 'integration',
        priority: 'high',
        estimatedComplexity: 8,
        requiredAgents: ['UI', 'Functional', 'DB']
      });
    }

    return scenarios.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  calculateScenarioPriority(scenario, patterns) {
    const criticalKeywords = ['payment', 'security', 'authentication', 'data'];
    const highKeywords = ['checkout', 'login', 'registration', 'cart'];
    
    const scenarioLower = scenario.toLowerCase();
    
    if (criticalKeywords.some(keyword => scenarioLower.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => scenarioLower.includes(keyword))) {
      return 'high';
    }
    
    // Consider pattern confidence
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    return avgConfidence > 0.8 ? 'medium' : 'low';
  }

  estimateComplexity(scenario) {
    const complexityKeywords = {
      'end-to-end': 8,
      'integration': 7,
      'workflow': 6,
      'validation': 4,
      'testing': 3,
      'basic': 2
    };

    const scenarioLower = scenario.toLowerCase();
    for (const [keyword, complexity] of Object.entries(complexityKeywords)) {
      if (scenarioLower.includes(keyword)) {
        return complexity;
      }
    }
    
    return 5; // Default complexity
  }

  determineRequiredAgents(scenario) {
    const scenarioLower = scenario.toLowerCase();
    const agents = [];

    if (scenarioLower.includes('ui') || scenarioLower.includes('form') || 
        scenarioLower.includes('navigation') || scenarioLower.includes('workflow')) {
      agents.push('UI');
    }
    
    if (scenarioLower.includes('api') || scenarioLower.includes('endpoint') || 
        scenarioLower.includes('authentication') || scenarioLower.includes('business')) {
      agents.push('Functional');
    }
    
    if (scenarioLower.includes('data') || scenarioLower.includes('persistence') || 
        scenarioLower.includes('integrity') || scenarioLower.includes('database')) {
      agents.push('DB');
    }

    // If no specific agents identified, use all for comprehensive testing
    return agents.length > 0 ? agents : ['UI', 'Functional', 'DB'];
  }

  calculateConfidence(patterns) {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const patternDiversity = new Set(patterns.map(p => p.type)).size;
    
    // Higher confidence with more diverse patterns
    return Math.min(avgConfidence + (patternDiversity * 0.1), 1.0);
  }

  updateLearningData(analysis) {
    // Store successful pattern recognition
    for (const pattern of analysis.detectedPatterns) {
      const key = `${pattern.type}_${pattern.source}`;
      if (!this.learningData.successfulScenarios[key]) {
        this.learningData.successfulScenarios[key] = 0;
      }
      this.learningData.successfulScenarios[key]++;
    }

    // Store analysis for future learning
    this.learningData.adaptationHistory.push({
      timestamp: analysis.timestamp,
      url: analysis.url,
      patternsDetected: analysis.detectedPatterns.length,
      confidence: analysis.confidence
    });

    // Keep only recent history (last 100 analyses)
    if (this.learningData.adaptationHistory.length > 100) {
      this.learningData.adaptationHistory = this.learningData.adaptationHistory.slice(-100);
    }

    this.saveLearningData();
  }

  recordTestOutcome(scenario, outcome, metrics) {
    const key = `${scenario.type}_${scenario.name}`;
    
    if (outcome === 'success') {
      if (!this.learningData.successfulScenarios[key]) {
        this.learningData.successfulScenarios[key] = 0;
      }
      this.learningData.successfulScenarios[key]++;
    } else {
      if (!this.learningData.failurePatterns[key]) {
        this.learningData.failurePatterns[key] = [];
      }
      this.learningData.failurePatterns[key].push({
        timestamp: new Date().toISOString(),
        error: outcome,
        metrics
      });
    }

    // Store performance metrics
    if (!this.learningData.performanceMetrics[key]) {
      this.learningData.performanceMetrics[key] = [];
    }
    this.learningData.performanceMetrics[key].push(metrics);

    this.saveLearningData();
  }

  getAdaptiveRecommendations(currentScenarios) {
    const recommendations = [];

    // Analyze historical success rates
    for (const scenario of currentScenarios) {
      const key = `${scenario.type}_${scenario.name}`;
      const successCount = this.learningData.successfulScenarios[key] || 0;
      const failures = this.learningData.failurePatterns[key] || [];
      
      if (failures.length > successCount) {
        recommendations.push({
          type: 'optimization',
          scenario: scenario.name,
          suggestion: 'Consider alternative approach - high failure rate detected',
          confidence: 0.8
        });
      }
    }

    // Suggest new scenarios based on learning
    const topPatterns = Object.entries(this.learningData.successfulScenarios)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    for (const [pattern, count] of topPatterns) {
      if (count > 10) { // High success pattern
        recommendations.push({
          type: 'enhancement',
          pattern,
          suggestion: `Consider expanding ${pattern} testing - high success rate`,
          confidence: 0.9
        });
      }
    }

    return recommendations;
  }

  saveLearningData() {
    try {
      writeFileSync('server/data/learning_data.json', 
        JSON.stringify(this.learningData, null, 2));
    } catch (error) {
      console.error('Failed to save learning data:', error);
    }
  }

  saveKnowledgeBase() {
    try {
      writeFileSync('server/data/knowledge_base.json', 
        JSON.stringify(this.knowledgeBase, null, 2));
    } catch (error) {
      console.error('Failed to save knowledge base:', error);
    }
  }
}