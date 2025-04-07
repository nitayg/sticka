
import { useEffect, useState } from 'react';
import { initializeFromStorage } from '../lib/sync';
import { useToast } from './ui/use-toast';

interface SyncInitializerProps {
  onError?: (error: Error) => void;
}

const SyncInitializer = ({ onError }: SyncInitializerProps) => {
  const [initStarted, setInitStarted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initStarted) return;
    
    setInitStarted(true);
    
    // Set a safety timeout
    const safetyTimeout = setTimeout(() => {
      console.warn('Sync initialization timeout reached');
      onError?.(new Error('Sync initialization timed out'));
    }, 10000);
    
    // Initialize data sync
    initializeFromStorage()
      .then(() => {
        clearTimeout(safetyTimeout);
        console.log('Sync initialized successfully');
      })
      .catch(error => {
        clearTimeout(safetyTimeout);
        console.error('Error initializing sync:', error);
        
        // Call onError callback if provided
        if (onError) {
          onError(error);
        }
        
        // Show error toast
        toast({
          title: 'שגיאת סנכרון',
          description: 'אירעה שגיאה באתחול הסנכרון. האפליקציה תפעל במצב מנותק.',
          variant: 'destructive',
        });
      });
    
    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [onError, toast, initStarted]);

  // This is a utility component, it doesn't render anything
  return null;
};

export default SyncInitializer;
