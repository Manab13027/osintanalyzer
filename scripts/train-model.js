#!/usr/bin/env node

const OllamaIntegration = require('../src/ai/ollama-integration');
const ModelTrainer = require('../src/ai/model-trainer');
const config = require('config');

async function main() {
  try {
    console.log('Initializing Ollama integration...');
    const ollama = new OllamaIntegration();
    await ollama.initialize();
    
    console.log('Initializing model trainer...');
    const modelTrainer = new ModelTrainer(ollama);
    
    const baseModel = process.argv[2] || config.get('ollama.defaultModel');
    const modelName = process.argv[3] || 'osint-assistant';
    
    console.log(`Creating custom model ${modelName} based on ${baseModel}...`);
    await modelTrainer.createCustomOSINTModel(baseModel, modelName);
    
    console.log('Model training completed successfully!');
  } catch (error) {
    console.error('Model training failed:', error.message);
    process.exit(1);
  }
}

main();