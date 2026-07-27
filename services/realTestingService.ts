import { WebSocketService } from './websocketService';
import { TestResult, AdvancedModule } from '../types';

export class RealTestingService {
  private wsService: WebSocketService;
  private apiBaseUrl: string;

  constructor() {
    this.wsService = new WebSocketService();
    this.apiBaseUrl = 'http://localhost:3001/api';
  }

  async initialize() {
    try {
      await this.wsService.connect();
      console.log('Real testing service initialized');
    } catch (error) {
      console.error('Failed to initialize real testing service:', error);
      throw error;
    }
  }

  async startRealTest(
    url: string, 
    budget: number, 
    modules: AdvancedModule[],
    onUpdate: (update: any) => void
  ): Promise<TestResult> {
    try {
      // Create test
      const response = await fetch(`${this.apiBaseUrl}/test/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, budget, modules }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { testId } = await response.json();

      // Set up WebSocket listeners for real-time updates
      this.wsService.onMessage('TEST_UPDATE', (data) => {
        onUpdate(data);
      });

      this.wsService.onMessage('test_complete', (data) => {
        onUpdate(data);
      });

      // Start the test
      this.wsService.send('START_TEST', { testId });

      // Poll for results (fallback if WebSocket fails)
      return await this.pollForResults(testId);

    } catch (error) {
      console.error('Real test execution failed:', error);
      throw error;
    }
  }

  private async pollForResults(testId: string): Promise<TestResult> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`${this.apiBaseUrl}/test/${testId}/status`);
        const status = await statusResponse.json();

        if (status.status === 'completed') {
          const resultsResponse = await fetch(`${this.apiBaseUrl}/test/${testId}/results`);
          return await resultsResponse.json();
        } else if (status.status === 'error') {
          throw new Error(status.error || 'Test execution failed');
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

      } catch (error) {
        console.error('Error polling for results:', error);
        attempts++;
      }
    }

    throw new Error('Test execution timed out');
  }

  async getTestStatus(testId: string) {
    const response = await fetch(`${this.apiBaseUrl}/test/${testId}/status`);
    return await response.json();
  }

  async getTestResults(testId: string) {
    const response = await fetch(`${this.apiBaseUrl}/test/${testId}/results`);
    return await response.json();
  }

  disconnect() {
    this.wsService.disconnect();
  }
}

// Singleton instance
export const realTestingService = new RealTestingService();