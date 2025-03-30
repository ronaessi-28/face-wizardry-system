
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FaceRegistration from '@/components/FaceRegistration';
import FaceRecognition from '@/components/FaceRecognition';
import RegisteredFaces from '@/components/RegisteredFaces';
import { Fingerprint, User, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { faceRecognitionService } from '@/lib/faceRecognitionService';

const Index = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize face recognition service
    const initFaceRecognition = async () => {
      try {
        await faceRecognitionService.initialize();
        faceRecognitionService.loadFaceDescriptorsFromStorage();
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error initializing face recognition:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize face recognition models. Please check your internet connection and reload the page.",
          variant: "destructive",
        });
      }
    };

    initFaceRecognition();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-face-background to-white">
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-face-dark mb-2">
            Face Wizardry
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A powerful and secure face recognition system for identity verification and access control
          </p>
        </header>

        {isModelLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="animate-pulse flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-face-primary/20"></div>
              <div className="h-7 w-48 bg-gray-200 rounded mb-2.5"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mb-2.5"></div>
              <div className="h-4 w-56 bg-gray-200 rounded"></div>
            </div>
            <p className="mt-6 text-gray-500">Loading face recognition models...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment on first load.</p>
          </div>
        ) : (
          <Tabs defaultValue="register" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="register" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Register Face
              </TabsTrigger>
              <TabsTrigger value="recognize" className="flex items-center">
                <Fingerprint className="h-4 w-4 mr-2" />
                Recognize Face
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Manage Faces
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <TabsContent value="register">
                <FaceRegistration />
              </TabsContent>
              
              <TabsContent value="recognize">
                <FaceRecognition />
              </TabsContent>
              
              <TabsContent value="manage">
                <RegisteredFaces />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Face Wizardry System &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-1">Secure • Private • Fast</p>
      </footer>
    </div>
  );
};

export default Index;
