const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

// Patch face-api.js to work with Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class FaceRecognition {
  constructor() {
    this.modelPath = config.get('faceRecognition.modelPath');
    this.confidenceThreshold = config.get('faceRecognition.confidenceThreshold');
    this.maxDistance = config.get('faceRecognition.maxDistance');
    this.modelsLoaded = false;
    this.faceDescriptors = new Map(); // Store known face descriptors
  }

  async initialize() {
    try {
      // Ensure model directory exists
      await fs.ensureDir(this.modelPath);
      
      // Load face detection models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromDisk(this.modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath),
        faceapi.nets.faceExpressionNet.loadFromDisk(this.modelPath),
      ]);
      
      this.modelsLoaded = true;
      console.log('Face recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading face recognition models:', error.message);
      throw error;
    }
  }

  async extractFaceDescriptor(imagePath) {
    if (!this.modelsLoaded) {
      await this.initialize();
    }
    
    try {
      // Load image
      const img = await canvas.loadImage(imagePath);
      
      // Detect faces
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length === 0) {
        throw new Error('No faces detected in the image');
      }
      
      // Return the descriptor of the first (largest) face
      const sortedDetections = detections.sort(
        (a, b) => b.detection.box.area - a.detection.box.area
      );
      
      return sortedDetections[0].descriptor;
    } catch (error) {
      console.error('Error extracting face descriptor:', error.message);
      throw error;
    }
  }

  async compareFaces(imagePath1, imagePath2) {
    try {
      // Extract descriptors for both images
      const descriptor1 = await this.extractFaceDescriptor(imagePath1);
      const descriptor2 = await this.extractFaceDescriptor(imagePath2);
      
      // Calculate Euclidean distance between descriptors
      const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
      
      // Calculate similarity score (0-1, where 1 is perfect match)
      const similarity = Math.max(0, 1 - distance / this.maxDistance);
      
      return {
        distance,
        similarity,
        isMatch: similarity >= this.confidenceThreshold
      };
    } catch (error) {
      console.error('Error comparing faces:', error.message);
      throw error;
    }
  }

  async addKnownFace(name, imagePath) {
    try {
      const descriptor = await this.extractFaceDescriptor(imagePath);
      this.faceDescriptors.set(name, descriptor);
      
      console.log(`Added known face for ${name}`);
      return true;
    } catch (error) {
      console.error(`Error adding known face for ${name}:`, error.message);
      return false;
    }
  }

  async findBestMatch(imagePath) {
    if (this.faceDescriptors.size === 0) {
      throw new Error('No known faces to compare against');
    }
    
    try {
      const descriptor = await this.extractFaceDescriptor(imagePath);
      let bestMatch = null;
      let bestDistance = Infinity;
      
      for (const [name, knownDescriptor] of this.faceDescriptors.entries()) {
        const distance = faceapi.euclideanDistance(descriptor, knownDescriptor);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = name;
        }
      }
      
      const similarity = Math.max(0, 1 - bestDistance / this.maxDistance);
      
      return {
        name: bestMatch,
        distance: bestDistance,
        similarity,
        isMatch: similarity >= this.confidenceThreshold
      };
    } catch (error) {
      console.error('Error finding best match:', error.message);
      throw error;
    }
  }

  async detectFaces(imagePath) {
    if (!this.modelsLoaded) {
      await this.initialize();
    }
    
    try {
      // Load image
      const img = await canvas.loadImage(imagePath);
      
      // Detect faces with expressions
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      // Process detections
      const faces = detections.map(detection => {
        const box = detection.detection.box;
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: detection.detection.score,
          expressions: detection.expressions,
          landmarks: detection.landmarks
        };
      });
      
      return faces;
    } catch (error) {
      console.error('Error detecting faces:', error.message);
      throw error;
    }
  }

  saveKnownFaces(filePath) {
    try {
      // Convert Map to Array for JSON serialization
      const facesArray = Array.from(this.faceDescriptors.entries()).map(([name, descriptor]) => ({
        name,
        descriptor: Array.from(descriptor) // Convert Float32Array to regular Array
      }));
      
      fs.writeJsonSync(filePath, facesArray);
      console.log(`Saved ${facesArray.length} known faces to ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error saving known faces:', error.message);
      return false;
    }
  }

  loadKnownFaces(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('Known faces file does not exist');
        return false;
      }
      
      const facesArray = fs.readJsonSync(filePath);
      
      // Convert Array back to Map
      this.faceDescriptors = new Map(
        facesArray.map(({ name, descriptor }) => [
          name,
          new Float32Array(descriptor) // Convert regular Array back to Float32Array
        ])
      );
      
      console.log(`Loaded ${facesArray.length} known faces from ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error loading known faces:', error.message);
      return false;
    }
  }
}

module.exports = FaceRecognition;