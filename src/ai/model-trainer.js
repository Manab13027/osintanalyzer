const fs = require('fs-extra');
const path = require('path');
const OllamaIntegration = require('./ollama-integration');

class ModelTrainer {
  constructor(ollamaIntegration) {
    this.ollama = ollamaIntegration;
    this.trainingDataPath = path.join(__dirname, '../../data/training-data.json');
  }

  async createCustomOSINTModel(baseModel, modelName) {
    try {
      // Load or prepare training data
      const trainingData = await this.prepareTrainingData();
      
      // Generate Modelfile
      const modelfile = this.generateModelfile(baseModel, trainingData);
      
      // Create the model
      await this.ollama.createCustomModel(baseModel, modelName, modelfile);
      
      console.log(`Custom OSINT model ${modelName} created successfully`);
      return modelName;
    } catch (error) {
      console.error('Error creating custom OSINT model:', error.message);
      throw error;
    }
  }

  generateModelfile(baseModel, trainingData) {
    let modelfile = `FROM ${baseModel}\n\n`;
    
    // Add system prompt
    modelfile += `SYSTEM You are an OSINT (Open Source Intelligence) assistant specialized in finding and analyzing social media profiles and online presence. You are skilled at:\n`;
    modelfile += `- Analyzing social media profiles and extracting key information\n`;
    modelfile += `- Matching names and usernames across different platforms\n`;
    modelfile += `- Analyzing images for facial recognition and distinctive features\n`;
    modelfile += `- Correlating information across multiple platforms\n`;
    modelfile += `- Identifying potential fake profiles or impersonations\n`;
    modelfile += `- Providing confidence scores for matches\n\n`;
    
    // Add training examples
    if (trainingData && trainingData.length > 0) {
      trainingData.forEach(example => {
        modelfile += `### Instruction:\n${example.instruction}\n\n`;
        modelfile += `### Response:\n${example.response}\n\n`;
      });
    } else {
      // Add some default examples if no training data is available
      modelfile += `### Instruction:\nAnalyze this social media profile and extract key information\n\n`;
      modelfile += `### Response:\nBased on the profile, I can identify: name, location, interests, and social connections. The profile appears to be authentic with a consistent posting history and engagement patterns.\n\n`;
      
      modelfile += `### Instruction:\nCompare these two profiles and determine if they belong to the same person\n\n`;
      modelfile += `### Response:\nAfter comparing the profiles, I found several similarities in name, location, and interests. The facial features in profile pictures have a 85% match. There's a high probability these profiles belong to the same person.\n\n`;
    }
    
    return modelfile;
  }

  async prepareTrainingData() {
    try {
      // Check if training data file exists
      if (await fs.pathExists(this.trainingDataPath)) {
        const data = await fs.readJson(this.trainingDataPath);
        return data.examples || [];
      }
      
      // Create default training data
      const defaultData = {
        examples: [
          {
            instruction: "Analyze this social media profile and extract key information",
            response: "Based on the profile, I can identify: name, location, interests, and social connections. The profile appears to be authentic with a consistent posting history and engagement patterns."
          },
          {
            instruction: "Compare these two profiles and determine if they belong to the same person",
            response: "After comparing the profiles, I found several similarities in name, location, and interests. The facial features in profile pictures have a 85% match. There's a high probability these profiles belong to the same person."
          },
          {
            instruction: "Search for a person named 'John Smith' who might be in New York and works in tech",
            response: "I found several potential matches for 'John Smith' in New York working in tech. The most promising profiles are on LinkedIn and Twitter, with consistent employment history and professional connections. I've ranked them by confidence score."
          }
        ]
      };
      
      // Create directory if it doesn't exist
      await fs.ensureDir(path.dirname(this.trainingDataPath));
      
      // Write default data
      await fs.writeJson(this.trainingDataPath, defaultData);
      
      return defaultData.examples;
    } catch (error) {
      console.error('Error preparing training data:', error.message);
      return [];
    }
  }

  async addTrainingExample(instruction, response) {
    try {
      let data = { examples: [] };
      
      // Load existing data
      if (await fs.pathExists(this.trainingDataPath)) {
        data = await fs.readJson(this.trainingDataPath);
      }
      
      // Add new example
      data.examples.push({ instruction, response });
      
      // Save updated data
      await fs.writeJson(this.trainingDataPath, data);
      
      console.log('Training example added successfully');
      return true;
    } catch (error) {
      console.error('Error adding training example:', error.message);
      return false;
    }
  }

  async retrainModel(modelName, baseModel) {
    try {
      // Delete existing model
      if (await this.ollama.isModelAvailable(modelName)) {
        await this.ollama.deleteModel(modelName);
      }
      
      // Create new model with updated training data
      await this.createCustomOSINTModel(baseModel, modelName);
      
      console.log(`Model ${modelName} retrained successfully`);
      return true;
    } catch (error) {
      console.error('Error retraining model:', error.message);
      return false;
    }
  }
}

module.exports = ModelTrainer;