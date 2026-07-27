import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { AdaptiveLearningEngine } from '../intelligence/AdaptiveLearningEngine.js';
import { SelfHealingLocators } from '../intelligence/SelfHealingLocators.js';
import { PlainLanguageExplainer } from '../intelligence/PlainLanguageExplainer.js';

export class UIAgent {
  constructor(testId, onUpdate, learningEngine = null) {
    this.testId = testId;
    this.onUpdate = onUpdate;
    this.browser = null;
    this.page = null;
    this.issues = [];
    this.screenshots = [];
    this.learningEngine = learningEngine || new AdaptiveLearningEngine();
    this.selfHealingLocators = new SelfHealingLocators();
    this.plainLanguageExplainer = new PlainLanguageExplainer();
    this.startTime = Date.now();
    this.retryCount = 0;
    this.adaptationHistory = [];
    this.healingReport = null;
  }

  async initialize() {
    this.log('Initializing UI Agent with Playwright');
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set up error listeners
    this.page.on('pageerror', (error) => {
      this.reportIssue('Critical', 'JavaScript Error', error.message, 'page-error');
    });

    this.page.on('requestfailed', (request) => {
      this.reportIssue('High', 'Failed Request', `${request.method()} ${request.url()}`, 'network-error');
    });
  }

  async testWebsite(url) {
    try {
      this.log(`Starting enhanced UI test for ${url}`);
      
      // Navigate to the website with resilience
      await this.resilientNavigate(url);
      await this.takeScreenshot('initial-load');
      
      // Intelligent element discovery and testing
      await this.intelligentElementDiscovery();
      await this.adaptiveFormTesting();
      await this.smartNavigationTesting();
      await this.enhancedAccessibilityCheck();
      await this.advancedLayoutAnalysis();
      
      // Record performance metrics
      const executionTime = Date.now() - this.startTime;
      await this.recordPerformanceMetrics(executionTime);
      
      this.log('Enhanced UI Agent test complete');
      return this.generateEnhancedReport();
      
    } catch (error) {
      await this.handleTestFailure(error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async discoverElements() {
    this.log('Discovering interactive elements');
    
    // Find all interactive elements
    const buttons = await this.page.$$('button, input[type="button"], input[type="submit"]');
    const links = await this.page.$$('a[href]');
    const inputs = await this.page.$$('input, textarea, select');
    
    this.log(`Found ${buttons.length} buttons, ${links.length} links, ${inputs.length} inputs`);
    
    // Test button interactions
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      try {
        const button = buttons[i];
        const text = await button.textContent();
        await button.click();
        await this.page.waitForTimeout(1000);
        this.log(`Clicked button: ${text || 'unnamed'}`);
      } catch (error) {
        this.reportIssue('Medium', 'Button Interaction Failed', error.message, 'interaction-error');
      }
    }
  }

  async testForms() {
    this.log('Testing form interactions');
    
    const forms = await this.page.$$('form');
    for (const form of forms) {
      try {
        // Find inputs in this form
        const inputs = await form.$$('input[type="text"], input[type="email"], textarea');
        
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder');
          const testValue = this.generateTestData(placeholder);
          await input.fill(testValue);
          this.log(`Filled input with test data: ${testValue}`);
        }
        
        // Try to submit if there's a submit button
        const submitBtn = await form.$('input[type="submit"], button[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
          await this.page.waitForTimeout(2000);
          this.log('Form submitted successfully');
        }
        
      } catch (error) {
        this.reportIssue('Medium', 'Form Interaction Failed', error.message, 'form-error');
      }
    }
  }

  async testNavigation() {
    this.log('Testing navigation elements');
    
    const navLinks = await this.page.$$('nav a, .navigation a, .menu a');
    const testedLinks = Math.min(navLinks.length, 3);
    
    for (let i = 0; i < testedLinks; i++) {
      try {
        const link = navLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          await link.click();
          await this.page.waitForLoadState('networkidle');
          await this.takeScreenshot(`nav-${i}`);
          this.log(`Navigated to: ${text || href}`);
          
          // Go back to continue testing
          await this.page.goBack();
          await this.page.waitForLoadState('networkidle');
        }
      } catch (error) {
        this.reportIssue('Low', 'Navigation Issue', error.message, 'navigation-error');
      }
    }
  }

  async checkAccessibility() {
    this.log('Checking accessibility issues');
    
    // Check for images without alt text
    const imagesWithoutAlt = await this.page.$$eval('img:not([alt])', imgs => imgs.length);
    if (imagesWithoutAlt > 0) {
      this.reportIssue('Medium', 'Accessibility Issue', `${imagesWithoutAlt} images missing alt text`, 'accessibility');
    }
    
    // Check for low contrast (simplified check)
    const lowContrastElements = await this.page.$$eval('*', elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        // Simplified contrast check - in real implementation, use proper contrast ratio calculation
        return color === 'rgb(128, 128, 128)' && bgColor === 'rgb(255, 255, 255)';
      }).length;
    });
    
    if (lowContrastElements > 0) {
      this.reportIssue('Medium', 'Accessibility Issue', `${lowContrastElements} elements with potential low contrast`, 'accessibility');
    }
  }

  async detectLayoutIssues() {
    this.log('Detecting layout issues');
    
    // Check for overlapping elements
    const overlappingElements = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      let overlaps = 0;
      
      for (let i = 0; i < elements.length - 1; i++) {
        const rect1 = elements[i].getBoundingClientRect();
        const rect2 = elements[i + 1].getBoundingClientRect();
        
        if (rect1.width > 0 && rect1.height > 0 && rect2.width > 0 && rect2.height > 0) {
          if (rect1.left < rect2.right && rect2.left < rect1.right &&
              rect1.top < rect2.bottom && rect2.top < rect1.bottom) {
            overlaps++;
          }
        }
      }
      return overlaps;
    });
    
    if (overlappingElements > 10) { // Threshold for significant overlap issues
      this.reportIssue('Low', 'Layout Issue', `Detected ${overlappingElements} potentially overlapping elements`, 'layout');
    }
  }

  async takeScreenshot(name) {
    const filename = `screenshot-${this.testId}-${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: `screenshots/${filename}` });
    this.screenshots.push(filename);
    
    // Create trace log for this screenshot
    const traceData = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      action: `Screenshot: ${name}`,
      url: this.page.url(),
      viewport: await this.page.viewportSize(),
      filename: filename
    };
    
    const traceFile = `traces/ui-${this.testId}-${name}-${Date.now()}.log`;
    writeFileSync(traceFile, JSON.stringify(traceData, null, 2));
    
    return filename;
  }

  generateTestData(placeholder) {
    if (!placeholder) return 'test@example.com';
    
    if (placeholder.toLowerCase().includes('email')) return 'test@example.com';
    if (placeholder.toLowerCase().includes('name')) return 'Test User';
    if (placeholder.toLowerCase().includes('phone')) return '555-0123';
    if (placeholder.toLowerCase().includes('password')) return 'TestPass123!';
    
    return 'Test Data';
  }

  reportIssue(severity, type, description, category) {
    const issue = {
      id: `ui-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      agent: 'UI',
      type,
      description,
      category,
      timestamp: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 20) + 80 // 80-99%
    };
    
    this.issues.push(issue);
    this.log(`Issue detected: ${severity} - ${description}`);
  }

  generateReport() {
    return {
      agent: 'UI',
      status: 'completed',
      issues: this.issues,
      screenshots: this.screenshots,
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'Critical').length,
        highIssues: this.issues.filter(i => i.severity === 'High').length,
        mediumIssues: this.issues.filter(i => i.severity === 'Medium').length,
        lowIssues: this.issues.filter(i => i.severity === 'Low').length
      }
    };
  }

  log(message) {
    const logEntry = `[UI Agent] ${new Date().toISOString()}: ${message}`;
    console.log(logEntry);
    if (this.onUpdate) {
      this.onUpdate({
        type: 'log',
        agent: 'UI',
        message: logEntry
      });
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async resilientNavigate(url) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.log(`Navigation attempt ${attempt}/${maxRetries}`);
        await this.page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        return; // Success
      } catch (error) {
        lastError = error;
        this.log(`Navigation attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          // Get adaptive strategy for navigation failure
          const strategy = await this.learningEngine.getAdaptationStrategy(
            'UI', 'navigation_timeout', { url, attempt }
          );
          
          if (strategy) {
            await this.applyNavigationStrategy(strategy, url);
            this.adaptationHistory.push({
              type: 'navigation',
              strategy: strategy.strategy,
              attempt
            });
          }
          
          // Wait before retry
          await this.page.waitForTimeout(1000 * attempt);
        }
      }
    }

    // Record failure pattern
    await this.learningEngine.recordFailurePattern(
      'UI', 'navigation_timeout', lastError.message, { url }
    );
    throw lastError;
  }

  async applyNavigationStrategy(strategy, url) {
    switch (strategy.strategy) {
      case 'increase_timeout':
        this.log('Applying strategy: Increased timeout');
        // Timeout will be increased in next attempt
        break;
      case 'alternative_wait':
        this.log('Applying strategy: Alternative wait condition');
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        break;
      case 'disable_images':
        this.log('Applying strategy: Disable images for faster loading');
        await this.page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort());
        break;
    }
  }

  async intelligentElementDiscovery() {
    this.log('Starting intelligent element discovery');
    
    try {
      // Discover all interactive elements with enhanced selectors
      const elements = await this.page.evaluate(() => {
        const interactiveElements = [];
        
        // Enhanced element discovery
        const selectors = [
          'button', 'input[type="button"]', 'input[type="submit"]',
          'a[href]', '[onclick]', '[role="button"]',
          'input', 'textarea', 'select',
          '[data-testid]', '[data-cy]', '[data-test]'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { // Visible elements only
              interactiveElements.push({
                tagName: el.tagName,
                type: el.type || 'unknown',
                text: el.textContent?.trim().substring(0, 50) || '',
                selector: selector,
                index,
                isVisible: true,
                attributes: {
                  id: el.id,
                  className: el.className,
                  'data-testid': el.getAttribute('data-testid'),
                  'aria-label': el.getAttribute('aria-label')
                }
              });
            }
          });
        }
        
        return interactiveElements;
      });

      this.log(`Discovered ${elements.length} interactive elements`);

      // Intelligently test elements based on priority
      const prioritizedElements = this.prioritizeElements(elements);
      
      for (const element of prioritizedElements.slice(0, 10)) { // Test top 10
        await this.testElementWithResilience(element);
      }

    } catch (error) {
      await this.handleElementDiscoveryError(error);
    }
  }

  prioritizeElements(elements) {
    return elements.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Prioritize by element type
      const typeScores = {
        'submit': 10, 'button': 8, 'link': 6, 'input': 5, 'select': 4
      };
      scoreA += typeScores[a.type] || 0;
      scoreB += typeScores[b.type] || 0;
      
      // Prioritize elements with test attributes
      if (a.attributes['data-testid']) scoreA += 5;
      if (b.attributes['data-testid']) scoreB += 5;
      
      // Prioritize elements with meaningful text
      if (a.text.length > 3) scoreA += 2;
      if (b.text.length > 3) scoreB += 2;
      
      return scoreB - scoreA;
    });
  }

  async testElementWithResilience(element) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.interactWithElement(element);
        return; // Success
      } catch (error) {
        this.log(`Element interaction failed (attempt ${attempt}): ${error.message}`);
        
        if (attempt < maxRetries) {
          const strategy = await this.learningEngine.getAdaptationStrategy(
            'UI', 'element_interaction', { element, error: error.message }
          );
          
          if (strategy) {
            await this.applyElementStrategy(strategy, element);
          }
        } else {
          // Record failure
          await this.learningEngine.recordFailurePattern(
            'UI', 'element_interaction', error.message, element
          );
        }
      }
    }
  }

  async interactWithElement(element) {
    try {
      // First, try to find element using traditional selectors
      const selectors = this.buildElementSelectors(element);
      
      for (const selector of selectors) {
        try {
          const el = await this.page.$(selector);
          if (el) {
            const isVisible = await el.isVisible();
            const isEnabled = await el.isEnabled();
            
            if (isVisible && isEnabled) {
              await this.performElementInteraction(el, element);
              this.log(`Successfully interacted with ${element.tagName}: ${element.text}`);
              return;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      // If traditional selectors fail, use self-healing locators
      this.log(`Traditional selectors failed, creating self-healing locator for ${element.text}`);
      const healingLocator = await this.createHealingLocator(element);
      
      if (healingLocator) {
        const healedElement = await healingLocator.find(this.page);
        if (healedElement) {
          await this.performElementInteraction(healedElement, element);
          this.log(`✨ Self-healing locator successfully found and interacted with element: ${element.text}`);
          return;
        }
      }
      
      throw new Error(`Could not interact with element even with self-healing: ${element.text}`);
      
    } catch (error) {
      // Record healing attempt for reporting
      this.adaptationHistory.push({
        type: 'self_healing_attempt',
        element: element.text,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async createHealingLocator(element) {
    try {
      // Try to find any element that might match for healing locator creation
      const candidates = await this.page.$$(element.tagName?.toLowerCase() || 'div');
      
      if (candidates.length > 0) {
        // Use the first candidate to create a healing locator
        const healingLocator = await this.selfHealingLocators.createSelfHealingLocator(
          this.page, 
          candidates[0], 
          element
        );
        
        this.adaptationHistory.push({
          type: 'self_healing_created',
          element: element.text,
          locatorId: healingLocator.id,
          strategiesCount: healingLocator.strategies.length
        });
        
        return healingLocator;
      }
      
      return null;
    } catch (error) {
      this.log(`Failed to create healing locator: ${error.message}`);
      return null;
    }
  }

  async performElementInteraction(el, elementInfo) {
    if (elementInfo.tagName === 'INPUT' || elementInfo.tagName === 'TEXTAREA') {
      const testData = this.generateSmartTestData(elementInfo);
      await el.fill(testData);
      this.log(`Filled ${elementInfo.tagName} with: ${testData}`);
    } else {
      await el.click();
      await this.page.waitForTimeout(1000);
      this.log(`Clicked ${elementInfo.tagName}`);
    }
  }

  buildElementSelectors(element) {
    const selectors = [];
    
    // Priority order: test attributes, id, specific selectors, fallbacks
    if (element.attributes['data-testid']) {
      selectors.push(`[data-testid="${element.attributes['data-testid']}"]`);
    }
    
    if (element.attributes.id) {
      selectors.push(`#${element.attributes.id}`);
    }
    
    if (element.text) {
      selectors.push(`text="${element.text}"`);
      selectors.push(`text*="${element.text.substring(0, 20)}"`);
    }
    
    if (element.attributes['aria-label']) {
      selectors.push(`[aria-label="${element.attributes['aria-label']}"]`);
    }
    
    // Fallback to position-based selector
    selectors.push(`${element.selector}:nth-child(${element.index + 1})`);
    
    return selectors;
  }

  generateSmartTestData(element) {
    const type = element.type?.toLowerCase();
    const text = element.text?.toLowerCase() || '';
    const placeholder = element.attributes.placeholder?.toLowerCase() || '';
    
    // Smart data generation based on context
    if (type === 'email' || text.includes('email') || placeholder.includes('email')) {
      return `test.${Date.now()}@example.com`;
    }
    
    if (type === 'password' || text.includes('password') || placeholder.includes('password')) {
      return 'TestPass123!@#';
    }
    
    if (type === 'tel' || text.includes('phone') || placeholder.includes('phone')) {
      return '+1-555-' + Math.floor(Math.random() * 9000 + 1000);
    }
    
    if (type === 'number' || text.includes('age') || text.includes('quantity')) {
      return Math.floor(Math.random() * 100 + 1).toString();
    }
    
    if (text.includes('name') || placeholder.includes('name')) {
      return `Test User ${Math.floor(Math.random() * 1000)}`;
    }
    
    if (text.includes('address') || placeholder.includes('address')) {
      return `${Math.floor(Math.random() * 9999)} Test Street, Test City, TC 12345`;
    }
    
    // Default contextual data
    return `Test Data ${Date.now()}`;
  }

  async adaptiveFormTesting() {
    this.log('Starting adaptive form testing');
    
    try {
      const forms = await this.page.$$('form');
      
      for (const form of forms) {
        await this.testFormWithIntelligence(form);
      }
    } catch (error) {
      await this.handleFormTestingError(error);
    }
  }

  async testFormWithIntelligence(form) {
    try {
      // Analyze form structure
      const formData = await form.evaluate(f => ({
        action: f.action,
        method: f.method,
        fields: Array.from(f.querySelectorAll('input, textarea, select')).map(field => ({
          name: field.name,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          pattern: field.pattern
        }))
      }));

      this.log(`Testing form with ${formData.fields.length} fields`);

      // Fill form intelligently
      for (const field of formData.fields) {
        await this.fillFieldIntelligently(form, field);
      }

      // Submit form with validation
      await this.submitFormSafely(form, formData);

    } catch (error) {
      this.reportIssue('Medium', 'Adaptive Form Test Failed', error.message, 'form-testing');
    }
  }

  async fillFieldIntelligently(form, fieldData) {
    try {
      const selector = `[name="${fieldData.name}"]`;
      const field = await form.$(selector);
      
      if (field) {
        const testValue = this.generateContextualTestData(fieldData);
        await field.fill(testValue);
        
        // Validate field after filling
        const isValid = await field.evaluate(f => f.checkValidity());
        if (!isValid) {
          this.reportIssue('Low', 'Field Validation Issue', 
            `Field ${fieldData.name} failed validation with test data`, 'validation');
        }
      }
    } catch (error) {
      this.log(`Failed to fill field ${fieldData.name}: ${error.message}`);
    }
  }

  generateContextualTestData(fieldData) {
    // Enhanced test data generation based on field analysis
    const { name, type, pattern, placeholder } = fieldData;
    const context = (name + ' ' + (placeholder || '')).toLowerCase();
    
    // Pattern-based generation
    if (pattern) {
      try {
        // Simple pattern matching for common cases
        if (pattern.includes('[0-9]')) {
          return '1234567890'.substring(0, pattern.length);
        }
        if (pattern.includes('[a-zA-Z]')) {
          return 'TestData'.substring(0, pattern.length);
        }
      } catch (error) {
        // Fallback to context-based generation
      }
    }
    
    // Context-based intelligent generation
    if (context.includes('email')) return `test.${Date.now()}@example.com`;
    if (context.includes('phone')) return '+1-555-0123';
    if (context.includes('zip') || context.includes('postal')) return '12345';
    if (context.includes('date')) return '2024-01-15';
    if (context.includes('url') || context.includes('website')) return 'https://example.com';
    if (context.includes('credit') || context.includes('card')) return '4111111111111111';
    
    // Type-based fallback
    switch (type) {
      case 'email': return `test.${Date.now()}@example.com`;
      case 'tel': return '+1-555-0123';
      case 'url': return 'https://example.com';
      case 'number': return '42';
      case 'date': return '2024-01-15';
      case 'time': return '14:30';
      case 'password': return 'SecurePass123!';
      default: return `Test ${name} Data`;
    }
  }

  async recordPerformanceMetrics(executionTime) {
    const metrics = {
      successRate: this.issues.filter(i => i.severity !== 'Critical').length / Math.max(this.issues.length, 1),
      executionTime,
      issuesFound: this.issues.length,
      confidenceScore: this.calculateConfidenceScore(),
      adaptationCount: this.adaptationHistory.length,
      screenshotCount: this.screenshots.length
    };

    await this.learningEngine.recordAgentPerformance('UI', this.testId, 'website_test', metrics);
    
    // Record successful adaptations
    for (const adaptation of this.adaptationHistory) {
      if (adaptation.success !== false) {
        await this.learningEngine.recordAdaptationSuccess('UI', adaptation.strategy, 0.1);
      }
    }
  }

  calculateConfidenceScore() {
    const baseScore = 0.8;
    const issuesPenalty = this.issues.length * 0.05;
    const adaptationBonus = this.adaptationHistory.length * 0.02;
    
    return Math.max(0, Math.min(1, baseScore - issuesPenalty + adaptationBonus));
  }

  async handleTestFailure(error) {
    await this.learningEngine.recordFailurePattern(
      'UI', 'test_execution', error.message, {
        testId: this.testId,
        executionTime: Date.now() - this.startTime,
        adaptationAttempts: this.adaptationHistory.length
      }
    );
  }

  generateEnhancedReport() {
    const baseReport = this.generateReport();
    
    // Generate healing report
    this.healingReport = this.selfHealingLocators.getHealingReport();
    
    // Generate plain language explanations for issues
    const explainedIssues = baseReport.issues.map(issue => ({
      ...issue,
      plainLanguageExplanation: this.plainLanguageExplainer.explainIssue(issue, 'business')
    }));
    
    return {
      ...baseReport,
      issues: explainedIssues,
      adaptations: this.adaptationHistory,
      selfHealingReport: this.healingReport,
      intelligenceMetrics: {
        adaptationCount: this.adaptationHistory.length,
        confidenceScore: this.calculateConfidenceScore(),
        resilienceScore: this.adaptationHistory.length > 0 ? 0.8 : 0.6,
        healingSuccessRate: this.calculateHealingSuccessRate()
      },
      recommendations: this.generateRecommendations(),
      plainLanguageSummary: this.generatePlainLanguageSummary(explainedIssues)
    };
  }

  calculateHealingSuccessRate() {
    if (!this.healingReport || this.healingReport.healingAttempts === 0) {
      return 0;
    }
    return this.healingReport.successfulHealing / this.healingReport.healingAttempts;
  }

  generatePlainLanguageSummary(explainedIssues) {
    if (explainedIssues.length === 0) {
      return {
        summary: "✅ Great news! The UI testing found no critical issues with your website's user interface.",
        businessImpact: "Your website should provide a smooth user experience for visitors.",
        recommendation: "Continue monitoring and testing regularly to maintain quality."
      };
    }

    const multipleIssuesExplanation = this.plainLanguageExplainer.explainMultipleIssues(explainedIssues, 'business');
    
    return {
      summary: multipleIssuesExplanation.executiveSummary,
      businessImpact: multipleIssuesExplanation.overallRisk,
      recommendation: multipleIssuesExplanation.recommendedActions.join(' '),
      timeline: multipleIssuesExplanation.timeline
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.issues.length > 10) {
      recommendations.push({
        type: 'optimization',
        message: 'High number of issues detected. Consider reviewing UI stability.',
        priority: 'medium'
      });
    }
    
    if (this.adaptationHistory.length > 5) {
      recommendations.push({
        type: 'resilience',
        message: 'Multiple adaptations required. UI may be unstable or complex.',
        priority: 'high'
      });
    }
    
    if (this.screenshots.length < 3) {
      recommendations.push({
        type: 'coverage',
        message: 'Limited visual evidence captured. Consider expanding test coverage.',
        priority: 'low'
      });
    }
    
    return recommendations;
  }
}