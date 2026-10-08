#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Setting up Web Application Test AI Agent...\n');

// Create necessary directories
const directories = ['screenshots', 'traces', 'har', 'queries'];
directories.forEach(dir => {
  const dirPath = join(__dirname, dir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Install Playwright browsers
console.log('\n📦 Installing Playwright browsers...');
try {
  execSync('npx playwright install', { stdio: 'inherit' });
  console.log('✅ Playwright browsers installed successfully');
} catch (error) {
  console.error('❌ Failed to install Playwright browsers:', error.message);
  console.log('You can install them manually later with: npx playwright install');
}

// Create environment file if it doesn't exist
const envPath = join(__dirname, '.env.local');
const envExamplePath = join(__dirname, '.env.local.example');

if (!existsSync(envPath)) {
  try {
    if (existsSync(envExamplePath)) {
      // Copy from example file
      execSync(`copy "${envExamplePath}" "${envPath}"`, { shell: true });
      console.log('✅ Created .env.local from template');
    } else {
      // Create basic file
      const envContent = `GEMINI_API_KEY=your_gemini_api_key_here\nPORT=3001\nNODE_ENV=development`;
      execSync(`echo ${envContent} > .env.local`, { shell: true });
      console.log('✅ Created basic .env.local file');
    }
    console.log('📝 Please update .env.local with your Gemini API key');
  } catch (error) {
    console.log('📝 Please create .env.local file manually and add your Gemini API key');
  }
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env.local with your Gemini API key');
console.log('2. Run: npm run dev:full (starts both frontend and backend)');
console.log('3. Or run separately:');
console.log('   - Frontend: npm run dev');
console.log('   - Backend: npm run server');
console.log('\n🔧 The system will now perform real browser automation, API testing, and database validation!');
