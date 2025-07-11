
import * as faceapi from '@vladmandic/face-api'; 
 
// This class provides face recognition functionality
export class FaceRecognitionService {
  private faceDetectionNet: faceapi.SsdMobilenetv1;
  private faceLandmarkNet: faceapi.FaceLandmark68Net;
  private faceRecognitionNet: faceapi.FaceRecognitionNet;
  private isInitialized: boolean = false;
  private labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[] = [];
  
  constructor() {
    // Initialize the face detection models
    this.faceDetectionNet = new faceapi.SsdMobilenetv1();
    this.faceLandmarkNet = new faceapi.FaceLandmark68Net();
    this.faceRecognitionNet = new faceapi.FaceRecognitionNet();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load models from the public folder
      await this.faceDetectionNet.loadFromUri('/models');
      await this.faceLandmarkNet.loadFromUri('/models');
      await this.faceRecognitionNet.loadFromUri('/models');
      
      console.log('Face recognition models loaded successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing face recognition models:', error);
      throw new Error('Failed to initialize face recognition models');
    }
  }

  public async detectFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.FaceDetection[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options());
  }

  public async detectFaceWithLandmarks(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await faceapi
      .detectAllFaces(image, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks();
  }

  public async getFaceDescriptor(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await faceapi
      .detectAllFaces(image, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();
  }

  public async registerFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, label: string): Promise<void> {
    const faceDescriptions = await this.getFaceDescriptor(image);
    
    if (faceDescriptions.length === 0) {
      throw new Error('No face detected in the image');
    }
    
    // Use the first face if multiple faces are detected
    const faceDescriptor = faceDescriptions[0].descriptor;
    
    // Save the face descriptor with its label
    const existingIndex = this.labeledFaceDescriptors.findIndex(descriptor => descriptor.label === label);
    
    if (existingIndex !== -1) {
      this.labeledFaceDescriptors[existingIndex] = new faceapi.LabeledFaceDescriptors(
        label,
        [faceDescriptor]
      );
    } else {
      this.labeledFaceDescriptors.push(
        new faceapi.LabeledFaceDescriptors(
          label,
          [faceDescriptor]
        )
      );
    }

    // Store in localStorage for persistence
    this.saveFaceDescriptorsToStorage();
  }

  public async recognizeFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ label: string, distance: number } | null> {
    if (this.labeledFaceDescriptors.length === 0) {
      return null; // No registered faces to compare with
    }
    
    const faceDescriptions = await this.getFaceDescriptor(image);
    
    if (faceDescriptions.length === 0) {
      return null; // No face detected
    }
    
    // Use the first face if multiple faces are detected
    const faceDescriptor = faceDescriptions[0].descriptor;
    
    // Create a face matcher
    const matcher = new faceapi.FaceMatcher(this.labeledFaceDescriptors, 0.6);
    
    // Find the best match
    const bestMatch = matcher.findBestMatch(faceDescriptor);
    
    if (bestMatch.label === 'unknown') {
      return null; // No match found
    }
    
    return {
      label: bestMatch.label,
      distance: bestMatch.distance
    };
  }

  public getAllRegisteredUsers(): string[] {
    return this.labeledFaceDescriptors.map(descriptor => descriptor.label);
  }

  public deleteRegisteredUser(label: string): boolean {
    const initialLength = this.labeledFaceDescriptors.length;
    this.labeledFaceDescriptors = this.labeledFaceDescriptors.filter(
      descriptor => descriptor.label !== label
    );
    
    if (this.labeledFaceDescriptors.length !== initialLength) {
      this.saveFaceDescriptorsToStorage();
      return true;
    }
    
    return false;
  }

  private saveFaceDescriptorsToStorage(): void {
    try {
      // Convert descriptors to plain objects for serialization
      const serialized = this.labeledFaceDescriptors.map(descriptor => ({
        label: descriptor.label,
        descriptors: descriptor.descriptors.map(d => Array.from(d)),
      }));
      
      localStorage.setItem('faceDescriptors', JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving face descriptors to localStorage:', error);
    }
  }

  public loadFaceDescriptorsFromStorage(): void {
    try {
      const serialized = localStorage.getItem('faceDescriptors');
      
      if (serialized) {
        const data = JSON.parse(serialized);
        
        this.labeledFaceDescriptors = data.map((item: any) => {
          // Convert arrays back to Float32Array for each descriptor
          const descriptors = item.descriptors.map((d: number[]) => new Float32Array(d));
          return new faceapi.LabeledFaceDescriptors(item.label, descriptors);
        });
      }
    } catch (error) {
      console.error('Error loading face descriptors from localStorage:', error);
    }
  }
}

// Create a singleton instance
export const faceRecognitionService = new FaceRecognitionService();
