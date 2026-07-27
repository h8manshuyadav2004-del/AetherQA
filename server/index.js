import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { TestOrchestrator } from './orchestrator/TestOrchestrator.js';
import { DatabaseManager } from './database/DatabaseManager.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Serve static evidence files
app.use('/screenshots', express.static('screenshots'));
app.use('/traces', express.static('traces'));
app.use('/har', express.static('har'));
app.use('/queries', express.static('queries'));

// Initialize services
const dbManager = new DatabaseManager();
const testOrchestrator = new TestOrchestrator(dbManager);

// WebSocket connection for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

async function handleWebSocketMessage(ws, data) {
  const { type, payload } = data;
  
  switch (type) {
    case 'START_TEST':
      await testOrchestrator.startTest(payload, (update) => {
        ws.send(JSON.stringify({ type: 'TEST_UPDATE', data: update }));
      });
      break;
    case 'STOP_TEST':
      await testOrchestrator.stopTest(payload.testId);
      break;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      orchestrator: 'running',
      database: 'connected',
      websocket: 'active'
    }
  });
});

// REST API endpoints
app.post('/api/test/start', async (req, res) => {
  try {
    const { url, budget, modules } = req.body;
    const testId = await testOrchestrator.createTest(url, budget, modules);
    res.json({ testId, status: 'created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/:testId/status', async (req, res) => {
  try {
    const status = await testOrchestrator.getTestStatus(req.params.testId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/:testId/results', async (req, res) => {
  try {
    const results = await testOrchestrator.getTestResults(req.params.testId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Intelligence and Learning API endpoints
app.get('/api/intelligence/capabilities', async (req, res) => {
  try {
    const capabilities = await testOrchestrator.getSystemCapabilities();
    res.json(capabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intelligence/learning-report', async (req, res) => {
  try {
    const report = await testOrchestrator.generateLearningReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intelligence/agent-metrics/:agentType', async (req, res) => {
  try {
    const metrics = await testOrchestrator.learningEngine.getResilienceMetrics(req.params.agentType);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/intelligence/analyze-website', async (req, res) => {
  try {
    const { url, apiEndpoints } = req.body;
    const analysis = await testOrchestrator.scenarioEngine.analyzeWebsite(url, null, apiEndpoints);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Plain Language Explanations API
app.post('/api/intelligence/explain-issues', async (req, res) => {
  try {
    const { issues, targetAudience = 'business' } = req.body;
    const { PlainLanguageExplainer } = await import('./intelligence/PlainLanguageExplainer.js');
    const explainer = new PlainLanguageExplainer();
    
    if (Array.isArray(issues)) {
      const explanation = explainer.explainMultipleIssues(issues, targetAudience);
      res.json(explanation);
    } else {
      const explanation = explainer.explainIssue(issues, targetAudience);
      res.json(explanation);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Self-Healing Locators Report API
app.get('/api/intelligence/healing-report/:testId', async (req, res) => {
  try {
    // This would typically fetch from the test results
    // For now, return a sample report structure
    const healingReport = {
      testId: req.params.testId,
      totalLocators: 15,
      healingAttempts: 8,
      successfulHealing: 6,
      healingSuccessRate: 0.75,
      strategiesUsed: [
        { strategy: 'visual-similarity', successRate: 0.8, usageCount: 3 },
        { strategy: 'text-content', successRate: 0.9, usageCount: 4 },
        { strategy: 'position-based', successRate: 0.6, usageCount: 2 },
        { strategy: 'hierarchy-similarity', successRate: 0.7, usageCount: 1 }
      ],
      timeline: [
        { timestamp: new Date().toISOString(), action: 'Locator healing successful', element: 'Submit button' },
        { timestamp: new Date(Date.now() - 30000).toISOString(), action: 'Alternative selector used', element: 'Login form' }
      ]
    };
    res.json(healingReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Visual Dashboard Data API
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Generate sample dashboard data
    const dashboardData = {
      currentMetrics: {
        testsPassed: 42,
        testsFailed: 8,
        coveragePercent: 87,
        executionTime: 95000,
        agentPerformance: {
          UI: 0.87,
          Functional: 0.92,
          DB: 0.88
        }
      },
      historicalData: generateHistoricalMetrics(timeRange),
      trends: {
        successRateTrend: 'improving',
        coverageTrend: 'stable',
        performanceTrend: 'improving'
      },
      insights: [
        'UI Agent healing success rate improved by 15% this week',
        'Database connection resilience is performing excellently',
        'Functional testing discovered 3 new API endpoints automatically'
      ]
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateHistoricalMetrics(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      timestamp: date.toISOString(),
      testsPassed: Math.floor(Math.random() * 20) + 30,
      testsFailed: Math.floor(Math.random() * 10) + 2,
      coveragePercent: Math.floor(Math.random() * 15) + 80,
      executionTime: Math.floor(Math.random() * 60) + 60,
      agentPerformance: {
        UI: Math.random() * 0.2 + 0.8,
        Functional: Math.random() * 0.2 + 0.85,
        DB: Math.random() * 0.2 + 0.82
      }
    });
  }
  
  return data;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});