#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const requiredModels = [
  'llama3',
  'llava',
  'codellama'
];

async function checkOllamaInstalled() {
  return new Promise((resolve) => {
    const process = spawn('ollama', ['--version'], { stdio: 'pipe' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    process.on('error', () => {
      resolve(false);
    });
  });
}

async function installOllama() {
  console.log('Installing Ollama...');
  
  return new Promise((resolve, reject) => {
    const process = spawn('curl', ['-fsSL', 'https://ollama.ai/install.sh', '|', 'sh'], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log('Ollama installed successfully');
        resolve();
      } else {
        console.error('Failed to install Ollama');
        reject(new Error('Ollama installation failed'));
      }
    });
  });
}

async function checkModelInstalled(modelName) {
  return new Promise((resolve) => {
    const process = spawn('ollama', ['list'], { stdio: 'pipe' });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output.includes(modelName));
      } else {
        resolve(false);
      }
    });
    
    process.on('error', () => {
      resolve(false);
    });
  });
}

async function downloadModel(modelName) {
  console.log(`Downloading model ${modelName}...`);
  
  return new Promise((resolve, reject) => {
    const process = spawn('ollama', ['pull', modelName], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Model ${modelName} downloaded successfully`);
        resolve();
      } else {
        console.error(`Failed to download model ${modelName}`);
        reject(new Error(`Failed to download model ${modelName}`));
      }
    });
  });
}

async function setupFaceRecognitionModels() {
  console.log('Setting up face recognition models...');
  
  const modelPath = config.get('faceRecognition.modelPath');
  await fs.ensureDir(modelPath);
  
  const models = [
    {
      name: 'tiny_face_detector_model-weights_manifest.json',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json'
    },
    {
      name: 'tiny_face_detector_model-shard1',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1'
    },
    {
      name: 'face_landmark_68_model-weights_manifest.json',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json'
    },
    {
      name: 'face_landmark_68_model-shard1',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1'
    },
    {
      name: 'face_recognition_model-weights_manifest.json',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json'
    },
    {
      name: 'face_recognition_model-shard1',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1'
    },
    {
      name: 'face_recognition_model-shard2',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2'
    },
    {
      name: 'face_expression_model-weights_manifest.json',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-weights_manifest.json'
    },
    {
      name: 'face_expression_model-shard1',
      url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-shard1'
    }
  ];
  
  const axios = require('axios');
  
  for (const model of models) {
    const modelPath = path.join(config.get('faceRecognition.modelPath'), model.name);
    
    if (!await fs.pathExists(modelPath)) {
      console.log(`Downloading ${model.name}...`);
      
      try {
        const response = await axios({
          method: 'GET',
          url: model.url,
          responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(modelPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        console.log(`${model.name} downloaded successfully`);
      } catch (error) {
        console.error(`Failed to download ${model.name}:`, error.message);
      }
    } else {
      console.log(`${model.name} already exists`);
    }
  }
}

async function main() {
  try {
    console.log('Setting up Ollama and required models...');
    
    // Check if Ollama is installed
    const ollamaInstalled = await checkOllamaInstalled();
    
    if (!ollamaInstalled) {
      await installOllama();
    } else {
      console.log('Ollama is already installed');
    }
    
    // Download required models
    for (const model of requiredModels) {
      const modelInstalled = await checkModelInstalled(model);
      
      if (!modelInstalled) {
        await downloadModel(model);
      } else {
        console.log(`Model ${model} is already installed`);
      }
    }
    
    // Setup face recognition models
    await setupFaceRecognitionModels();
    
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main();