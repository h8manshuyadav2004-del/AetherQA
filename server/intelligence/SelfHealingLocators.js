export class SelfHealingLocators {
  constructor() {
    this.locatorHistory = new Map();
    this.visualFingerprints = new Map();
    this.healingStrategies = this.initializeHealingStrategies();
  }

  initializeHealingStrategies() {
    return {
      // Primary strategies - most reliable
      primary: [
        'data-testid',
        'data-cy', 
        'data-test',
        'id',
        'aria-label',
        'role'
      ],
      // Secondary strategies - moderately reliable
      secondary: [
        'className',
        'tagName + text',
        'xpath',
        'css-selector'
      ],
      // Fallback strategies - last resort
      fallback: [
        'position-based',
        'visual-similarity',
        'text-content',
        'element-hierarchy'
      ]
    };
  }

  async createSelfHealingLocator(page, element, elementInfo) {
    const locatorId = `locator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Capture comprehensive element data
    const elementData = await this.captureElementData(page, element, elementInfo);
    
    // Create multiple locator strategies
    const locatorStrategies = await this.generateLocatorStrategies(elementData);
    
    // Store for future healing
    this.locatorHistory.set(locatorId, {
      originalElement: elementData,
      strategies: locatorStrategies,
      successHistory: new Map(),
      lastUsed: Date.now(),
      healingAttempts: 0
    });

    return {
      id: locatorId,
      strategies: locatorStrategies,
      find: (page) => this.findWithHealing(page, locatorId),
      heal: (page) => this.healLocator(page, locatorId)
    };
  }

  async captureElementData(page, element, elementInfo) {
    try {
      const elementData = await element.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        
        return {
          // Basic properties
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          textContent: el.textContent?.trim().substring(0, 100),
          
          // Attributes
          attributes: {
            'data-testid': el.getAttribute('data-testid'),
            'data-cy': el.getAttribute('data-cy'),
            'data-test': el.getAttribute('data-test'),
            'aria-label': el.getAttribute('aria-label'),
            'role': el.getAttribute('role'),
            'type': el.getAttribute('type'),
            'name': el.getAttribute('name'),
            'placeholder': el.getAttribute('placeholder')
          },
          
          // Position and visual properties
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          
          // Visual fingerprint
          visual: {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            border: computedStyle.border,
            display: computedStyle.display
          },
          
          // Hierarchy information
          hierarchy: {
            parentTagName: el.parentElement?.tagName,
            parentId: el.parentElement?.id,
            parentClassName: el.parentElement?.className,
            siblingCount: el.parentElement?.children.length || 0,
            indexInParent: Array.from(el.parentElement?.children || []).indexOf(el)
          }
        };
      });

      // Generate visual fingerprint
      const visualFingerprint = await this.generateVisualFingerprint(page, element);
      elementData.visualFingerprint = visualFingerprint;

      return elementData;
    } catch (error) {
      console.log(`Failed to capture element data: ${error.message}`);
      return elementInfo || {};
    }
  }

  async generateVisualFingerprint(page, element) {
    try {
      // Take a small screenshot of just the element
      const boundingBox = await element.boundingBox();
      if (!boundingBox) return null;

      const screenshot = await page.screenshot({
        clip: {
          x: Math.max(0, boundingBox.x - 5),
          y: Math.max(0, boundingBox.y - 5),
          width: Math.min(boundingBox.width + 10, 200),
          height: Math.min(boundingBox.height + 10, 100)
        }
      });

      // Create a simple hash of the screenshot for comparison
      const hash = this.createImageHash(screenshot);
      return {
        hash,
        boundingBox,
        timestamp: Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  createImageHash(buffer) {
    // Simple hash function for image comparison
    let hash = 0;
    for (let i = 0; i < Math.min(buffer.length, 1000); i += 10) {
      hash = ((hash << 5) - hash + buffer[i]) & 0xffffffff;
    }
    return hash.toString(36);
  }

  async generateLocatorStrategies(elementData) {
    const strategies = [];

    // Primary strategies (most reliable)
    for (const attr of this.healingStrategies.primary) {
      const value = elementData.attributes?.[attr];
      if (value) {
        strategies.push({
          type: 'attribute',
          strategy: attr,
          selector: `[${attr}="${value}"]`,
          confidence: 0.95,
          priority: 1
        });
      }
    }

    // ID-based strategy
    if (elementData.id) {
      strategies.push({
        type: 'id',
        strategy: 'id',
        selector: `#${elementData.id}`,
        confidence: 0.90,
        priority: 1
      });
    }

    // Text-based strategies
    if (elementData.textContent && elementData.textContent.length > 2) {
      strategies.push({
        type: 'text',
        strategy: 'exact-text',
        selector: `text="${elementData.textContent}"`,
        confidence: 0.85,
        priority: 2
      });
      
      strategies.push({
        type: 'text',
        strategy: 'partial-text',
        selector: `text*="${elementData.textContent.substring(0, 20)}"`,
        confidence: 0.75,
        priority: 2
      });
    }

    // Class-based strategy
    if (elementData.className) {
      const classes = elementData.className.split(' ').filter(c => c.length > 0);
      for (const cls of classes.slice(0, 3)) { // Use top 3 classes
        strategies.push({
          type: 'class',
          strategy: 'class',
          selector: `.${cls}`,
          confidence: 0.70,
          priority: 2
        });
      }
    }

    // XPath strategies
    if (elementData.hierarchy) {
      const xpath = this.generateXPath(elementData);
      if (xpath) {
        strategies.push({
          type: 'xpath',
          strategy: 'xpath',
          selector: xpath,
          confidence: 0.80,
          priority: 2
        });
      }
    }

    // Position-based fallback
    if (elementData.position) {
      strategies.push({
        type: 'position',
        strategy: 'position',
        selector: `${elementData.tagName}:nth-child(${elementData.hierarchy?.indexInParent + 1 || 1})`,
        confidence: 0.60,
        priority: 3
      });
    }

    // Sort by priority and confidence
    return strategies.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.confidence - a.confidence;
    });
  }

  generateXPath(elementData) {
    try {
      let xpath = `//${elementData.tagName.toLowerCase()}`;
      
      // Add attribute conditions
      const conditions = [];
      
      if (elementData.id) {
        conditions.push(`@id="${elementData.id}"`);
      }
      
      if (elementData.textContent && elementData.textContent.length < 50) {
        conditions.push(`text()="${elementData.textContent}"`);
      }
      
      if (elementData.attributes?.['data-testid']) {
        conditions.push(`@data-testid="${elementData.attributes['data-testid']}"`);
      }
      
      if (conditions.length > 0) {
        xpath += `[${conditions.join(' and ')}]`;
      }
      
      return xpath;
    } catch (error) {
      return null;
    }
  }

  async findWithHealing(page, locatorId) {
    const locatorData = this.locatorHistory.get(locatorId);
    if (!locatorData) {
      throw new Error(`Locator ${locatorId} not found in history`);
    }

    // Try strategies in order of priority and success history
    const sortedStrategies = this.sortStrategiesBySuccess(locatorData.strategies, locatorData.successHistory);

    for (const strategy of sortedStrategies) {
      try {
        const element = await this.tryStrategy(page, strategy);
        if (element) {
          // Record success
          this.recordStrategySuccess(locatorId, strategy);
          return element;
        }
      } catch (error) {
        // Record failure and continue
        this.recordStrategyFailure(locatorId, strategy, error.message);
      }
    }

    // If all strategies failed, attempt healing
    console.log(`All strategies failed for locator ${locatorId}, attempting healing...`);
    return await this.healLocator(page, locatorId);
  }

  sortStrategiesBySuccess(strategies, successHistory) {
    return strategies.sort((a, b) => {
      const aSuccess = successHistory.get(a.strategy) || { success: 0, total: 0 };
      const bSuccess = successHistory.get(b.strategy) || { success: 0, total: 0 };
      
      const aRate = aSuccess.total > 0 ? aSuccess.success / aSuccess.total : a.confidence;
      const bRate = bSuccess.total > 0 ? bSuccess.success / bSuccess.total : b.confidence;
      
      return bRate - aRate;
    });
  }

  async tryStrategy(page, strategy) {
    switch (strategy.type) {
      case 'attribute':
      case 'id':
      case 'class':
        return await page.$(strategy.selector);
      
      case 'text':
        return await page.locator(strategy.selector).first();
      
      case 'xpath':
        return await page.$(`xpath=${strategy.selector}`);
      
      case 'position':
        return await page.$(strategy.selector);
      
      default:
        return null;
    }
  }

  async healLocator(page, locatorId) {
    const locatorData = this.locatorHistory.get(locatorId);
    if (!locatorData) return null;

    locatorData.healingAttempts++;
    console.log(`Healing attempt #${locatorData.healingAttempts} for locator ${locatorId}`);

    // Strategy 1: Find similar elements by visual fingerprint
    const visualMatch = await this.findByVisualSimilarity(page, locatorData.originalElement);
    if (visualMatch) {
      await this.updateLocatorStrategies(locatorId, visualMatch);
      return visualMatch;
    }

    // Strategy 2: Find by text content similarity
    const textMatch = await this.findByTextSimilarity(page, locatorData.originalElement);
    if (textMatch) {
      await this.updateLocatorStrategies(locatorId, textMatch);
      return textMatch;
    }

    // Strategy 3: Find by position similarity
    const positionMatch = await this.findByPositionSimilarity(page, locatorData.originalElement);
    if (positionMatch) {
      await this.updateLocatorStrategies(locatorId, positionMatch);
      return positionMatch;
    }

    // Strategy 4: Find by hierarchy similarity
    const hierarchyMatch = await this.findByHierarchySimilarity(page, locatorData.originalElement);
    if (hierarchyMatch) {
      await this.updateLocatorStrategies(locatorId, hierarchyMatch);
      return hierarchyMatch;
    }

    console.log(`Healing failed for locator ${locatorId} after ${locatorData.healingAttempts} attempts`);
    return null;
  }

  async findByVisualSimilarity(page, originalElement) {
    if (!originalElement.visualFingerprint) return null;

    try {
      // Find all elements of the same type
      const candidates = await page.$$(originalElement.tagName.toLowerCase());
      
      for (const candidate of candidates) {
        const candidateFingerprint = await this.generateVisualFingerprint(page, candidate);
        if (candidateFingerprint && this.compareVisualFingerprints(originalElement.visualFingerprint, candidateFingerprint)) {
          console.log('Found element by visual similarity');
          return candidate;
        }
      }
    } catch (error) {
      console.log(`Visual similarity search failed: ${error.message}`);
    }
    
    return null;
  }

  compareVisualFingerprints(original, candidate) {
    if (!original || !candidate) return false;
    
    // Compare image hashes
    if (original.hash === candidate.hash) return true;
    
    // Compare bounding box similarity (within 20% tolerance)
    const originalBox = original.boundingBox;
    const candidateBox = candidate.boundingBox;
    
    if (originalBox && candidateBox) {
      const widthSimilarity = Math.abs(originalBox.width - candidateBox.width) / originalBox.width;
      const heightSimilarity = Math.abs(originalBox.height - candidateBox.height) / originalBox.height;
      
      return widthSimilarity < 0.2 && heightSimilarity < 0.2;
    }
    
    return false;
  }

  async findByTextSimilarity(page, originalElement) {
    if (!originalElement.textContent || originalElement.textContent.length < 3) return null;

    try {
      const originalText = originalElement.textContent.toLowerCase().trim();
      
      // Try exact match first
      const exactMatch = await page.locator(`text="${originalText}"`).first();
      if (await exactMatch.count() > 0) {
        console.log('Found element by exact text match');
        return exactMatch;
      }
      
      // Try partial match
      const partialMatch = await page.locator(`text*="${originalText.substring(0, 15)}"`).first();
      if (await partialMatch.count() > 0) {
        console.log('Found element by partial text match');
        return partialMatch;
      }
      
    } catch (error) {
      console.log(`Text similarity search failed: ${error.message}`);
    }
    
    return null;
  }

  async findByPositionSimilarity(page, originalElement) {
    if (!originalElement.position) return null;

    try {
      const candidates = await page.$$(originalElement.tagName.toLowerCase());
      const originalPos = originalElement.position;
      
      for (const candidate of candidates) {
        const candidateBox = await candidate.boundingBox();
        if (candidateBox) {
          // Check if position is within 50px tolerance
          const xDiff = Math.abs(candidateBox.x - originalPos.x);
          const yDiff = Math.abs(candidateBox.y - originalPos.y);
          
          if (xDiff < 50 && yDiff < 50) {
            console.log('Found element by position similarity');
            return candidate;
          }
        }
      }
    } catch (error) {
      console.log(`Position similarity search failed: ${error.message}`);
    }
    
    return null;
  }

  async findByHierarchySimilarity(page, originalElement) {
    if (!originalElement.hierarchy) return null;

    try {
      // Look for elements with similar parent structure
      const parentSelector = originalElement.hierarchy.parentTagName?.toLowerCase();
      if (parentSelector) {
        const parentElements = await page.$$(parentSelector);
        
        for (const parent of parentElements) {
          const children = await parent.$$(originalElement.tagName.toLowerCase());
          
          // Check if any child matches our criteria
          for (const child of children) {
            const childData = await this.captureElementData(page, child, {});
            if (this.compareHierarchy(originalElement.hierarchy, childData.hierarchy)) {
              console.log('Found element by hierarchy similarity');
              return child;
            }
          }
        }
      }
    } catch (error) {
      console.log(`Hierarchy similarity search failed: ${error.message}`);
    }
    
    return null;
  }

  compareHierarchy(original, candidate) {
    if (!original || !candidate) return false;
    
    // Compare parent tag names
    if (original.parentTagName === candidate.parentTagName) {
      // Compare sibling count (within 2 tolerance)
      const siblingDiff = Math.abs(original.siblingCount - candidate.siblingCount);
      if (siblingDiff <= 2) {
        return true;
      }
    }
    
    return false;
  }

  async updateLocatorStrategies(locatorId, newElement) {
    try {
      const newElementData = await this.captureElementData(null, newElement, {});
      const newStrategies = await this.generateLocatorStrategies(newElementData);
      
      const locatorData = this.locatorHistory.get(locatorId);
      if (locatorData) {
        // Merge new strategies with existing ones
        locatorData.strategies = [...newStrategies, ...locatorData.strategies];
        locatorData.originalElement = newElementData;
        locatorData.lastUsed = Date.now();
        
        console.log(`Updated locator strategies for ${locatorId}`);
      }
    } catch (error) {
      console.log(`Failed to update locator strategies: ${error.message}`);
    }
  }

  recordStrategySuccess(locatorId, strategy) {
    const locatorData = this.locatorHistory.get(locatorId);
    if (locatorData) {
      const strategyStats = locatorData.successHistory.get(strategy.strategy) || { success: 0, total: 0 };
      strategyStats.success++;
      strategyStats.total++;
      locatorData.successHistory.set(strategy.strategy, strategyStats);
    }
  }

  recordStrategyFailure(locatorId, strategy, error) {
    const locatorData = this.locatorHistory.get(locatorId);
    if (locatorData) {
      const strategyStats = locatorData.successHistory.get(strategy.strategy) || { success: 0, total: 0 };
      strategyStats.total++;
      locatorData.successHistory.set(strategy.strategy, strategyStats);
    }
  }

  getHealingReport() {
    const report = {
      totalLocators: this.locatorHistory.size,
      healingAttempts: 0,
      successfulHealing: 0,
      strategyEffectiveness: new Map()
    };

    for (const [locatorId, data] of this.locatorHistory) {
      report.healingAttempts += data.healingAttempts;
      
      if (data.healingAttempts > 0 && data.successHistory.size > 0) {
        report.successfulHealing++;
      }
      
      // Aggregate strategy effectiveness
      for (const [strategy, stats] of data.successHistory) {
        const existing = report.strategyEffectiveness.get(strategy) || { success: 0, total: 0 };
        existing.success += stats.success;
        existing.total += stats.total;
        report.strategyEffectiveness.set(strategy, existing);
      }
    }

    return report;
  }
}