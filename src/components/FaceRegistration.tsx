
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Save, User, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import WebcamCapture from './WebcamCapture';
import { faceRecognitionService } from '@/lib/faceRecognitionService';

const FaceRegistration: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionState, setDetectionState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setDetectionState('idle');
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setDetectionState('idle');
  };

  const handleRegister = async () => {
    if (!capturedImage) {
      toast({
        title: "No image captured",
        description: "Please capture your face image first.",
        variant: "destructive",
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name for registration.",
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

      // Initialize face recognition service if needed
      await faceRecognitionService.initialize();
      
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
      
      // Register the face
      await faceRecognitionService.registerFace(img, userName);
      
      toast({
        title: "Registration Successful",
        description: `${userName} has been registered successfully.`,
      });
      
      setDetectionState('success');
      
      // Reset form after successful registration
      setTimeout(() => {
        setUserName('');
        setCapturedImage(null);
        setDetectionState('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error registering face:', error);
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
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
        <CardTitle className="text-face-primary flex items-center">
          <User className="mr-2" />
          Register Your Face
        </CardTitle>
        <CardDescription>
          Capture your face image and register it in the system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!capturedImage ? (
          <WebcamCapture 
            onCapture={handleCapture} 
            isDetecting={detectionState === 'processing'}
            detectionResult={
              detectionState === 'success' ? 'success' : 
              detectionState === 'error' ? 'failure' : 
              null
            }
            guidanceText="Position your face in the center"
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
              
              {detectionState === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-face-success/30 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <User className="h-8 w-8 text-face-success" />
                  </div>
                </div>
              )}
              
              {detectionState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-face-error/30 rounded-lg">
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
            
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isProcessing || detectionState === 'success'}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {capturedImage && detectionState !== 'success' && (
          <>
            <Button
              variant="outline"
              onClick={resetCapture}
              disabled={isProcessing}
            >
              Retake
            </Button>
            
            <Button
              onClick={handleRegister}
              disabled={isProcessing || !userName.trim()}
              className="bg-face-primary hover:bg-face-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </>
        )}
        
        {(!capturedImage || detectionState === 'success') && (
          <div className="w-full">
            {detectionState === 'success' && (
              <Button 
                className="w-full bg-face-success hover:bg-face-success/90"
                onClick={resetCapture}
              >
                Registration Complete - Register Another Face
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FaceRegistration;
