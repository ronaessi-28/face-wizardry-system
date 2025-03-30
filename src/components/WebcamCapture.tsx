
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Camera, User, Check, X } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  isDetecting?: boolean;
  detectionResult?: 'success' | 'failure' | null;
  guidanceText?: string;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  isDetecting = false,
  detectionResult = null,
  guidanceText = "Position your face in the center of the frame",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreamActive(true);
          setErrorMessage(null);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setErrorMessage('Could not access the camera. Please ensure you have granted permission and no other app is using it.');
        setIsStreamActive(false);
      }
    };

    startCamera();

    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setIsStreamActive(false);
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isStreamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageSrc = canvas.toDataURL('image/png');
        onCapture(imageSrc);
      }
    }
  };

  // Status overlay to show detection status
  const renderStatusOverlay = () => {
    if (isDetecting) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <div className="animate-pulse flex flex-col items-center">
            <Loader className="h-12 w-12 text-white animate-spin" />
            <span className="text-white font-semibold mt-2">Processing...</span>
          </div>
        </div>
      );
    }
    
    if (detectionResult === 'success') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-face-success/30 rounded-lg">
          <div className="flex flex-col items-center">
            <Check className="h-16 w-16 text-white" />
            <span className="text-white font-semibold mt-2">Recognition Successful!</span>
          </div>
        </div>
      );
    }
    
    if (detectionResult === 'failure') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-face-error/30 rounded-lg">
          <div className="flex flex-col items-center">
            <X className="h-16 w-16 text-white" />
            <span className="text-white font-semibold mt-2">Recognition Failed</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <div className="relative">
        {/* Webcam video display */}
        <div className="relative bg-black rounded-t-lg overflow-hidden">
          {errorMessage ? (
            <div className="flex flex-col items-center justify-center h-[360px] p-4 bg-gray-900 text-white text-center">
              <User className="h-16 w-16 mb-4 text-gray-400" />
              <p>{errorMessage}</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef}
                className="w-full h-[360px] object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Scanner animation effect */}
              <div className="absolute left-0 right-0 h-1 bg-face-primary/50 top-0 z-10 animate-scanning" />
              
              {/* Face position guidance */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border-2 border-face-primary/50 flex items-center justify-center animate-pulse-ring">
                  <div className="text-white text-xs bg-black/40 px-2 py-1 rounded-full">
                    {guidanceText}
                  </div>
                </div>
              </div>
              
              {/* Status overlay */}
              {renderStatusOverlay()}
            </>
          )}
        </div>
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Control buttons */}
        <div className="p-4 flex justify-center bg-gray-50">
          <Button 
            onClick={captureImage}
            disabled={!isStreamActive || isDetecting}
            className="bg-face-primary hover:bg-face-primary/90"
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WebcamCapture;
