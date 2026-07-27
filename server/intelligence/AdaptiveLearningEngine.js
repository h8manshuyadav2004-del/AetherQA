import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { DatabaseManager } from '../database/DatabaseManager.js';

export class AdaptiveLearningEngine {
  constructor() {
    this.ensureDataDirectory();
    this.learningDb = null;
    this.agentPerformance = this.loadAgentPerformance();
    this.adaptationStrategies = this.initializeStrategies();
    this.resiliencePatterns = this.loadResiliencePatterns();
    this.initializeLearningDatabase();
  }

  ensureDataDirectory() {
    if (!existsSync('server/data')) {
      mkdirSync('server/data', { recursive: true });
    }
  }

  async initializeLearningDatabase() {
    try {
      const dbManager = new DatabaseManager();
      this.learningDb = await dbManager.createTestDatabase();
      
      // Create learning tables
      this.learningDb.exec(`
        CREATE TABLE IF NOT EXISTS agent_performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_type TEXT NOT NULL,
          test_id TEXT NOT NULL,
          scenario TEXT NOT NULL,
          success_rate REAL,
          execution_time INTEGER,
          issues_found INTEGER,
          confidence_score REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.learningDb.exec(`
        CREATE TABLE IF NOT EXISTS failure_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_type TEXT NOT NULL,
          failure_type TEXT NOT NULL,
          error_message TEXT,
          context TEXT,
          frequency INTEGER DEFAULT 1,
          last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolution_strategy TEXT
        )
      `);

      this.learningDb.exec(`
        CREATE TABLE IF NOT EXISTS adaptation_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id TEXT NOT NULL,
          adaptation_type TEXT NOT NULL,
          original_strategy TEXT,
          adapted_strategy TEXT,
          improvement_metric REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.learningDb.exec(`
        CREATE TABLE IF NOT EXISTS resilience_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_type TEXT NOT NULL,
          resilience_score REAL,
          recovery_time INTEGER,
          adaptation_count INTEGER,
          success_after_adaptation REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('[AdaptiveLearning] Learning database initialized');
    } catch (error) {
      console.error('Failed to initialize learning database:', error);
    }
  }

  loadAgentPerformance() {
    const perfPath = 'server/data/agent_performance.json';
    if (existsSync(perfPath)) {
      try {
        return JSON.parse(readFileSync(perfPath, 'utf8'));
      } catch (error) {
        console.log('Creating new agent performance data');
      }
    }

    return {
      UI: {
        successRate: 0.85,
        avgExecutionTime: 45000,
        commonFailures: [],
        adaptationCount: 0,
        lastImprovement: null
      },
      Functional: {
        successRate: 0.90,
        avgExecutionTime: 30000,
        commonFailures: [],
        adaptationCount: 0,
        lastImprovement: null
      },
      DB: {
        successRate: 0.88,
        avgExecutionTime: 15000,
        commonFailures: [],
        adaptationCount: 0,
        lastImprovement: null
      }
    };
  }

  initializeStrategies() {
    return {
      retryStrategies: {
        exponentialBackoff: {
          name: 'Exponential Backoff',
          maxRetries: 3,
          baseDelay: 1000,
          multiplier: 2,
          applicableErrors: ['timeout', 'network', 'temporary']
        },
        linearBackoff: {
          name: 'Linear Backoff',
          maxRetries: 5,
          baseDelay: 2000,
          multiplier: 1,
          applicableErrors: ['rate_limit', 'server_busy']
        },
        immediateRetry: {
          name: 'Immediate Retry',
          maxRetries: 2,
          baseDelay: 0,
          multiplier: 1,
          applicableErrors: ['flaky_element', 'race_condition']
        }
      },
      adaptationStrategies: {
        elementSelection: {
          name: 'Dynamic Element Selection',
          fallbackSelectors: [
            'xpath', 'css', 'text', 'attribute', 'position'
          ],
          confidence: 0.8
        },
        apiEndpointDiscovery: {
          name: 'Alternative Endpoint Discovery',
          fallbackMethods: [
            'common_paths', 'sitemap_analysis', 'robots_txt', 'link_crawling'
          ],
          confidence: 0.7
        },
        databaseConnection: {
          name: 'Connection Pool Management',
          fallbackStrategies: [
            'connection_retry', 'pool_recreation', 'alternative_config'
          ],
          confidence: 0.9
        }
      }
    };
  }

  loadResiliencePatterns() {
    const resiliencePath = 'server/data/resilience_patterns.json';
    if (existsSync(resiliencePath)) {
      try {
        return JSON.parse(readFileSync(resiliencePath, 'utf8'));
      } catch (error) {
        console.log('Creating new resilience patterns');
      }
    }

    return {
      uiPatterns: {
        elementNotFound: {
          adaptations: ['wait_longer', 'alternative_selector', 'scroll_to_element'],
          successRate: 0.75
        },
        staleElement: {
          adaptations: ['re_find_element', 'refresh_page', 'wait_for_stability'],
          successRate: 0.80
        },
        timeoutError: {
          adaptations: ['increase_timeout', 'break_into_steps', 'alternative_approach'],
          successRate: 0.70
        }
      },
      functionalPatterns: {
        connectionTimeout: {
          adaptations: ['retry_with_backoff', 'alternative_endpoint', 'reduce_payload'],
          successRate: 0.85
        },
        authenticationFailure: {
          adaptations: ['refresh_token', 'alternative_auth', 'guest_mode'],
          successRate: 0.60
        },
        rateLimitExceeded: {
          adaptations: ['exponential_backoff', 'request_batching', 'alternative_api'],
          successRate: 0.90
        }
      },
      databasePatterns: {
        connectionLost: {
          adaptations: ['reconnect', 'connection_pool_reset', 'fallback_database'],
          successRate: 0.95
        },
        queryTimeout: {
          adaptations: ['query_optimization', 'result_pagination', 'index_suggestion'],
          successRate: 0.80
        },
        lockTimeout: {
          adaptations: ['retry_with_delay', 'alternative_isolation', 'batch_processing'],
          successRate: 0.75
        }
      }
    };
  }

  async recordAgentPerformance(agentType, testId, scenario, metrics) {
    try {
      // Store in database
      if (this.learningDb) {
        this.learningDb.prepare(`
          INSERT INTO agent_performance 
          (agent_type, test_id, scenario, success_rate, execution_time, issues_found, confidence_score)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run([
          agentType,
          testId,
          scenario,
          metrics.successRate || 0,
          metrics.executionTime || 0,
          metrics.issuesFound || 0,
          metrics.confidenceScore || 0
        ]);
      }

      // Update in-memory performance data
      const agent = this.agentPerformance[agentType];
      if (agent) {
        // Calculate rolling average
        agent.successRate = (agent.successRate * 0.8) + (metrics.successRate * 0.2);
        agent.avgExecutionTime = (agent.avgExecutionTime * 0.8) + (metrics.executionTime * 0.2);
        
        if (metrics.error) {
          agent.commonFailures.push({
            error: metrics.error,
            timestamp: new Date().toISOString(),
            context: metrics.context
          });
          
          // Keep only recent failures
          if (agent.commonFailures.length > 50) {
            agent.commonFailures = agent.commonFailures.slice(-50);
          }
        }
      }

      this.saveAgentPerformance();
    } catch (error) {
      console.error('Failed to record agent performance:', error);
    }
  }

  async recordFailurePattern(agentType, failureType, errorMessage, context) {
    try {
      if (this.learningDb) {
        // Check if pattern exists
        const existing = this.learningDb.prepare(`
          SELECT id, frequency FROM failure_patterns 
          WHERE agent_type = ? AND failure_type = ? AND error_message = ?
        `).get([agentType, failureType, errorMessage]);

        if (existing) {
          // Update frequency
          this.learningDb.prepare(`
            UPDATE failure_patterns 
            SET frequency = frequency + 1, last_seen = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run([existing.id]);
        } else {
          // Insert new pattern
          this.learningDb.prepare(`
            INSERT INTO failure_patterns 
            (agent_type, failure_type, error_message, context)
            VALUES (?, ?, ?, ?)
          `).run([agentType, failureType, errorMessage, JSON.stringify(context)]);
        }
      }

      console.log(`[AdaptiveLearning] Recorded failure pattern: ${agentType} - ${failureType}`);
    } catch (error) {
      console.error('Failed to record failure pattern:', error);
    }
  }

  async getAdaptationStrategy(agentType, errorType, context = {}) {
    try {
      // Get historical data for this error type
      let failureHistory = [];
      if (this.learningDb) {
        failureHistory = this.learningDb.prepare(`
          SELECT * FROM failure_patterns 
          WHERE agent_type = ? AND failure_type = ? 
          ORDER BY frequency DESC, last_seen DESC
          LIMIT 5
        `).all([agentType, errorType]);
      }

      // Get resilience patterns for this agent and error type
      const agentPatterns = this.resiliencePatterns[`${agentType.toLowerCase()}Patterns`];
      const errorPattern = agentPatterns?.[errorType];

      if (errorPattern) {
        // Select best adaptation based on success rate and frequency
        const adaptations = errorPattern.adaptations.map(adaptation => ({
          strategy: adaptation,
          successRate: errorPattern.successRate,
          frequency: failureHistory.find(f => 
            f.resolution_strategy === adaptation
          )?.frequency || 0
        }));

        // Sort by success rate and inverse frequency (try less used strategies first)
        adaptations.sort((a, b) => {
          const aScore = a.successRate - (a.frequency * 0.1);
          const bScore = b.successRate - (b.frequency * 0.1);
          return bScore - aScore;
        });

        const selectedStrategy = adaptations[0];
        
        // Record the adaptation attempt
        await this.recordAdaptationAttempt(agentType, errorType, selectedStrategy.strategy);

        return {
          strategy: selectedStrategy.strategy,
          confidence: selectedStrategy.successRate,
          retryConfig: this.getRetryConfig(errorType),
          fallbackStrategies: adaptations.slice(1, 3).map(a => a.strategy)
        };
      }

      // Default fallback strategy
      return {
        strategy: 'basic_retry',
        confidence: 0.5,
        retryConfig: this.adaptationStrategies.retryStrategies.exponentialBackoff,
        fallbackStrategies: ['manual_intervention']
      };

    } catch (error) {
      console.error('Failed to get adaptation strategy:', error);
      return null;
    }
  }

  getRetryConfig(errorType) {
    // Map error types to appropriate retry strategies
    const errorToStrategy = {
      'timeout': 'exponentialBackoff',
      'network': 'exponentialBackoff',
      'rate_limit': 'linearBackoff',
      'server_busy': 'linearBackoff',
      'flaky_element': 'immediateRetry',
      'race_condition': 'immediateRetry'
    };

    const strategyName = errorToStrategy[errorType] || 'exponentialBackoff';
    return this.adaptationStrategies.retryStrategies[strategyName];
  }

  async recordAdaptationAttempt(agentType, errorType, strategy) {
    try {
      if (this.learningDb) {
        this.learningDb.prepare(`
          INSERT INTO adaptation_history 
          (test_id, adaptation_type, original_strategy, adapted_strategy)
          VALUES (?, ?, ?, ?)
        `).run([
          `adaptation-${Date.now()}`,
          errorType,
          'default',
          strategy
        ]);
      }

      // Update agent adaptation count
      if (this.agentPerformance[agentType]) {
        this.agentPerformance[agentType].adaptationCount++;
      }

    } catch (error) {
      console.error('Failed to record adaptation attempt:', error);
    }
  }

  async recordAdaptationSuccess(agentType, strategy, improvementMetric) {
    try {
      // Update resilience patterns with success
      const agentPatterns = this.resiliencePatterns[`${agentType.toLowerCase()}Patterns`];
      
      // Find and update the pattern that used this strategy
      for (const [errorType, pattern] of Object.entries(agentPatterns)) {
        if (pattern.adaptations.includes(strategy)) {
          // Improve success rate slightly
          pattern.successRate = Math.min(pattern.successRate + 0.05, 1.0);
          break;
        }
      }

      // Record in database
      if (this.learningDb) {
        this.learningDb.prepare(`
          UPDATE adaptation_history 
          SET improvement_metric = ? 
          WHERE adapted_strategy = ? AND timestamp > datetime('now', '-1 hour')
        `).run([improvementMetric, strategy]);
      }

      // Update agent performance
      if (this.agentPerformance[agentType]) {
        this.agentPerformance[agentType].lastImprovement = {
          strategy,
          improvement: improvementMetric,
          timestamp: new Date().toISOString()
        };
      }

      this.saveResiliencePatterns();
      this.saveAgentPerformance();

      console.log(`[AdaptiveLearning] Recorded successful adaptation: ${agentType} - ${strategy}`);
    } catch (error) {
      console.error('Failed to record adaptation success:', error);
    }
  }

  async getResilienceMetrics(agentType) {
    try {
      const agent = this.agentPerformance[agentType];
      if (!agent) return null;

      let dbMetrics = {};
      if (this.learningDb) {
        const recent = this.learningDb.prepare(`
          SELECT 
            AVG(success_rate) as avg_success_rate,
            AVG(execution_time) as avg_execution_time,
            COUNT(*) as total_tests
          FROM agent_performance 
          WHERE agent_type = ? AND timestamp > datetime('now', '-7 days')
        `).get([agentType]);

        const adaptations = this.learningDb.prepare(`
          SELECT COUNT(*) as adaptation_count
          FROM adaptation_history 
          WHERE adaptation_type LIKE '%${agentType.toLowerCase()}%' 
          AND timestamp > datetime('now', '-7 days')
        `).get();

        dbMetrics = {
          recentSuccessRate: recent?.avg_success_rate || 0,
          recentAvgTime: recent?.avg_execution_time || 0,
          recentTests: recent?.total_tests || 0,
          recentAdaptations: adaptations?.adaptation_count || 0
        };
      }

      return {
        agentType,
        currentSuccessRate: agent.successRate,
        avgExecutionTime: agent.avgExecutionTime,
        adaptationCount: agent.adaptationCount,
        resilienceScore: this.calculateResilienceScore(agent, dbMetrics),
        lastImprovement: agent.lastImprovement,
        commonFailureTypes: this.getCommonFailureTypes(agent.commonFailures),
        ...dbMetrics
      };

    } catch (error) {
      console.error('Failed to get resilience metrics:', error);
      return null;
    }
  }

  calculateResilienceScore(agent, dbMetrics) {
    // Resilience score based on multiple factors
    const successWeight = 0.4;
    const adaptationWeight = 0.3;
    const improvementWeight = 0.2;
    const consistencyWeight = 0.1;

    const successScore = agent.successRate;
    const adaptationScore = Math.min(agent.adaptationCount / 10, 1.0); // Normalize to 0-1
    const improvementScore = agent.lastImprovement ? 0.8 : 0.2;
    const consistencyScore = dbMetrics.recentSuccessRate ? 
      (1 - Math.abs(agent.successRate - dbMetrics.recentSuccessRate)) : 0.5;

    return (
      successScore * successWeight +
      adaptationScore * adaptationWeight +
      improvementScore * improvementWeight +
      consistencyScore * consistencyWeight
    );
  }

  getCommonFailureTypes(failures) {
    const failureCount = {};
    
    for (const failure of failures.slice(-20)) { // Last 20 failures
      const type = failure.error || 'unknown';
      failureCount[type] = (failureCount[type] || 0) + 1;
    }

    return Object.entries(failureCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  async generateLearningReport() {
    const report = {
      timestamp: new Date().toISOString(),
      agentMetrics: {},
      overallTrends: {},
      recommendations: []
    };

    // Get metrics for each agent
    for (const agentType of ['UI', 'Functional', 'DB']) {
      report.agentMetrics[agentType] = await this.getResilienceMetrics(agentType);
    }

    // Calculate overall trends
    if (this.learningDb) {
      const trends = this.learningDb.prepare(`
        SELECT 
          DATE(timestamp) as date,
          AVG(success_rate) as avg_success_rate,
          COUNT(*) as test_count
        FROM agent_performance 
        WHERE timestamp > datetime('now', '-30 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT 7
      `).all();

      report.overallTrends = {
        weeklyTrends: trends,
        improvementTrend: this.calculateImprovementTrend(trends)
      };
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.agentMetrics);

    return report;
  }

  calculateImprovementTrend(trends) {
    if (trends.length < 2) return 'insufficient_data';
    
    const recent = trends[0].avg_success_rate;
    const older = trends[trends.length - 1].avg_success_rate;
    
    const improvement = recent - older;
    
    if (improvement > 0.05) return 'improving';
    if (improvement < -0.05) return 'declining';
    return 'stable';
  }

  generateRecommendations(agentMetrics) {
    const recommendations = [];

    for (const [agentType, metrics] of Object.entries(agentMetrics)) {
      if (!metrics) continue;

      if (metrics.currentSuccessRate < 0.8) {
        recommendations.push({
          type: 'performance',
          agent: agentType,
          priority: 'high',
          message: `${agentType} agent success rate is below 80%. Consider reviewing test strategies.`,
          suggestedAction: 'analyze_failure_patterns'
        });
      }

      if (metrics.adaptationCount < 5) {
        recommendations.push({
          type: 'resilience',
          agent: agentType,
          priority: 'medium',
          message: `${agentType} agent has low adaptation count. May need more resilience strategies.`,
          suggestedAction: 'enhance_adaptation_strategies'
        });
      }

      if (metrics.resilienceScore > 0.9) {
        recommendations.push({
          type: 'optimization',
          agent: agentType,
          priority: 'low',
          message: `${agentType} agent shows excellent resilience. Consider sharing strategies with other agents.`,
          suggestedAction: 'cross_agent_learning'
        });
      }
    }

    return recommendations;
  }

  saveAgentPerformance() {
    try {
      writeFileSync('server/data/agent_performance.json', 
        JSON.stringify(this.agentPerformance, null, 2));
    } catch (error) {
      console.error('Failed to save agent performance:', error);
    }
  }

  saveResiliencePatterns() {
    try {
      writeFileSync('server/data/resilience_patterns.json', 
        JSON.stringify(this.resiliencePatterns, null, 2));
    } catch (error) {
      console.error('Failed to save resilience patterns:', error);
    }
  }
}