
import React, { useState, useEffect } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Fingerprint, Loader, User, AlertCircle, Check, RefreshCcw } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { faceRecognitionService } from '@/lib/faceRecognitionService';

const FaceRecognition: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{ label: string; confidence: string } | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [detectionState, setDetectionState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the face recognition service and load registered faces
    const initFaceRecognition = async () => {
      try {
        await faceRecognitionService.initialize();
        faceRecognitionService.loadFaceDescriptorsFromStorage();
        updateRegisteredUsersList();
      } catch (error) {
        console.error('Error initializing face recognition:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize face recognition system. Please reload the page.",
          variant: "destructive",
        });
      }
    };

    initFaceRecognition();
  }, [toast]);

  const updateRegisteredUsersList = () => {
    const users = faceRecognitionService.getAllRegisteredUsers();
    setRegisteredUsers(users);
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setDetectionState('idle');
    setRecognitionResult(null);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setDetectionState('idle');
    setRecognitionResult(null);
  };

  const handleRecognize = async () => {
    if (!capturedImage) {
      toast({
        title: "No image captured",
        description: "Please capture your face image first.",
        variant: "destructive",
      });
      return;
    }

    if (registeredUsers.length === 0) {
      toast({
        title: "No registered users",
        description: "Please register at least one face before attempting recognition.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDetectionState('processing');

    try {
      // Create an image element from the captured image
      const img = new Image();
      img.src = capturedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect if there's a face in the image
      const detections = await faceRecognitionService.detectFace(img);
      
      if (detections.length === 0) {
        toast({
          title: "No face detected",
          description: "Please capture a clear image of your face and try again.",
          variant: "destructive",
        });
        setDetectionState('error');
        return;
      }
      
      // Perform face recognition
      const result = await faceRecognitionService.recognizeFace(img);
      
      if (result) {
        const confidence = ((1 - result.distance) * 100).toFixed(1);
        setRecognitionResult({
          label: result.label,
          confidence: `${confidence}%`
        });
        
        toast({
          title: "Recognition Successful",
          description: `Identified as ${result.label} with ${confidence}% confidence.`,
        });
        
        setDetectionState('success');
      } else {
        toast({
          title: "Recognition Failed",
          description: "Your face does not match any registered user.",
          variant: "destructive",
        });
        
        setDetectionState('error');
      }
      
    } catch (error) {
      console.error('Error recognizing face:', error);
      toast({
        title: "Recognition Failed",
        description: "An error occurred during recognition. Please try again.",
        variant: "destructive",
      });
      setDetectionState('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-face-secondary flex items-center">
          <Fingerprint className="mr-2" />
          Face Recognition
        </CardTitle>
        <CardDescription>
          Capture your face to verify your identity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {registeredUsers.length === 0 ? (
          <div className="p-6 text-center bg-face-background rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-face-primary mb-4" />
            <h3 className="text-lg font-medium text-face-dark mb-2">No Registered Faces</h3>
            <p className="text-sm text-gray-500 mb-4">
              You need to register at least one face before using recognition.
            </p>
            <Button 
              className="bg-face-primary hover:bg-face-primary/90"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Go to Registration
            </Button>
          </div>
        ) : !capturedImage ? (
          <WebcamCapture 
            onCapture={handleCapture} 
            isDetecting={detectionState === 'processing'}
            detectionResult={
              detectionState === 'success' ? 'success' : 
              detectionState === 'error' ? 'failure' : 
              null
            }
            guidanceText="Look directly at the camera"
          />
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="w-full h-64 object-cover rounded-lg border border-gray-200" 
              />
              
              {detectionState === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              
              {detectionState === 'success' && recognitionResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-face-success/20 rounded-lg">
                  <div className="bg-white p-3 rounded-full mb-2">
                    <Check className="h-8 w-8 text-face-success" />
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <div className="font-bold text-face-dark">{recognitionResult.label}</div>
                    <div className="text-sm text-gray-500">Confidence: {recognitionResult.confidence}</div>
                  </div>
                </div>
              )}
              
              {detectionState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-face-error/20 rounded-lg">
                  <Button 
                    variant="outline" 
                    className="bg-white" 
                    onClick={resetCapture}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {registeredUsers.length > 0 && capturedImage && detectionState !== 'success' && detectionState !== 'processing' && (
          <>
            <Button
              variant="outline"
              onClick={resetCapture}
            >
              Retake
            </Button>
            
            <Button
              onClick={handleRecognize}
              disabled={isProcessing}
              className="bg-face-secondary hover:bg-face-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Recognize
                </>
              )}
            </Button>
          </>
        )}
        
        {detectionState === 'success' && (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={resetCapture}
          >
            New Recognition
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FaceRecognition;
