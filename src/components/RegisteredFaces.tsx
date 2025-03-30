
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Users, Trash2, User, RefreshCw } from 'lucide-react';
import { faceRecognitionService } from '@/lib/faceRecognitionService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const RegisteredFaces: React.FC = () => {
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadRegisteredUsers = () => {
    const users = faceRecognitionService.getAllRegisteredUsers();
    setRegisteredUsers(users);
  };

  useEffect(() => {
    // Load registered users when component mounts
    loadRegisteredUsers();
  }, []);

  const handleDeleteUser = (user: string) => {
    setUserToDelete(user);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const result = faceRecognitionService.deleteRegisteredUser(userToDelete);
      
      if (result) {
        toast({
          title: "User Deleted",
          description: `${userToDelete} has been removed from the system.`,
        });
        loadRegisteredUsers();
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete the user. Please try again.",
          variant: "destructive",
        });
      }
      
      setUserToDelete(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-face-dark flex items-center">
          <Users className="mr-2" />
          Registered Faces
        </CardTitle>
        <CardDescription>
          Manage users registered in the system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRegisteredUsers}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
        
        {registeredUsers.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No registered users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {registeredUsers.map((user, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-face-background rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-face-primary rounded-full flex items-center justify-center text-white">
                    {user.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 font-medium">{user}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteUser(user)}
                  className="text-face-error hover:text-face-error/90 hover:bg-face-error/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {userToDelete}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-face-error hover:bg-face-error/90"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RegisteredFaces;
