const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

class OllamaIntegration {
  constructor() {
    this.ollamaUrl = config.get('ollama.url');
    this.models = {};
    this.defaultModel = config.get('ollama.defaultModel');
    this.imageModel = config.get('ollama.imageModel');
    this.maxTokens = config.get('ollama.maxTokens');
  }

  async initialize() {
    try {
      // Load available models
      await this.loadModels();
      
      // Check if required models are available
      await this.checkModelAvailability();
      
      console.log('Ollama integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Ollama integration:', error);
      throw error;
    }
  }

  async loadModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const data = response.data;
      
      this.models = {};
      data.models.forEach(model => {
        this.models[model.name] = model;
      });
      
      console.log(`Loaded ${Object.keys(this.models).length} models from Ollama`);
    } catch (error) {
      console.error('Error loading Ollama models:', error.message);
      throw error;
    }
  }

  async checkModelAvailability() {
    const requiredModels = [
      this.defaultModel,
      this.imageModel,
    ];
    
    for (const model of requiredModels) {
      if (!this.models[model]) {
        console.log(`Model ${model} not found. Downloading...`);
        await this.downloadModel(model);
      }
    }
  }

  async downloadModel(model) {
    try {
      console.log(`Downloading model ${model}...`);
      
      // In a real implementation, you would use a proper streaming approach
      // For now, we'll just simulate the download
      const response = await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: model,
      }, {
        timeout: 300000, // 5 minutes timeout
      });
      
      console.log(`Model ${model} downloaded successfully`);
      
      // Refresh the models list
      await this.loadModels();
    } catch (error) {
      console.error(`Error downloading model ${model}:`, error.message);
      throw error;
    }
  }

  async analyzeImage(imagePath, prompt = 'Describe this image in detail') {
    if (!this.models[this.imageModel]) {
      throw new Error(`${this.imageModel} model not available for image analysis`);
    }
    
    try {
      // Convert image to base64
      const imageBase64 = await this.imageToBase64(imagePath);
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.imageModel,
        prompt: prompt,
        images: [imageBase64],
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: this.maxTokens,
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error analyzing image:', error.message);
      throw error;
    }
  }

  async generateText(prompt, model = this.defaultModel, options = {}) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: model,
        prompt: prompt,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: this.maxTokens,
          ...options
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error generating text:', error.message);
      throw error;
    }
  }

  async imageToBase64(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('Error converting image to base64:', error.message);
      throw error;
    }
  }

  async createCustomModel(baseModel, modelName, modelfile) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/create`, {
        name: modelName,
        modelfile: modelfile,
      });
      
      console.log(`Custom model ${modelName} created successfully`);
      
      // Refresh the models list
      await this.loadModels();
      
      return modelName;
    } catch (error) {
      console.error('Error creating custom model:', error.message);
      throw error;
    }
  }

  async deleteModel(modelName) {
    try {
      const response = await axios.delete(`${this.ollamaUrl}/api/delete`, {
        data: {
          name: modelName,
        }
      });
      
      console.log(`Model ${modelName} deleted successfully`);
      
      // Refresh the models list
      await this.loadModels();
      
      return true;
    } catch (error) {
      console.error('Error deleting model:', error.message);
      throw error;
    }
  }

  async listModels() {
    return Object.keys(this.models);
  }

  async isModelAvailable(modelName) {
    return this.models.hasOwnProperty(modelName);
  }
}

module.exports = OllamaIntegration;