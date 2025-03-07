
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forceSync, isSyncInProgress } from '@/lib/sync-manager';
import { useToast } from '@/hooks/use-toast';

const SyncButton = () => {
  const [syncing, setSyncing] = useState(isSyncInProgress());
  const { toast } = useToast();
  
  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    toast({
      title: "מסנכרן נתונים",
      description: "מתחיל סנכרון ידני עם השרת...",
    });
    
    try {
      await forceSync();
      toast({
        title: "סנכרון הושלם",
        description: "הנתונים סונכרנו בהצלחה עם השרת",
      });
    } catch (error) {
      console.error('שגיאה בסנכרון ידני:', error);
      toast({
        title: "שגיאת סנכרון",
        description: "אירעה שגיאה בסנכרון הנתונים",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSync} 
      disabled={syncing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {syncing ? 
        <Loader2 className="w-4 h-4 animate-spin" /> : 
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 8L15 12H18C18 15.31 15.31 18 12 18C10.99 18 10.03 17.75 9.2 17.3L7.74 18.76C8.97 19.54 10.43 20 12 20C16.42 20 20 16.42 20 12H23L19 8Z" fill="currentColor"/>
          <path d="M6 12C6 8.69 8.69 6 12 6C13.01 6 13.97 6.25 14.8 6.7L16.26 5.24C15.03 4.46 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12H6Z" fill="currentColor"/>
        </svg>
      }
      {syncing ? 'מסנכרן...' : 'סנכרן עכשיו'}
    </Button>
  );
};

export default SyncButton;
