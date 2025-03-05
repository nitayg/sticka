
import { useEffect, useState } from 'react';
import { testConnection } from '@/lib/supabase-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const SupabaseInitializer = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const connected = await testConnection();
        setConnectionStatus(connected ? 'success' : 'error');
        if (!connected) {
          setErrorMessage('לא ניתן להתחבר ל-Supabase. יש לוודא שה-API key הוגדר נכון.');
        }
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'שגיאה לא ידועה בהתחברות ל-Supabase');
      }
    };

    initSupabase();
  }, []);

  if (connectionStatus === 'checking') {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">בודק חיבור לסנכרון...</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>שגיאת חיבור ל-Supabase</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (connectionStatus === 'success') {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">מחובר לסנכרון!</AlertTitle>
        </Alert>
      </div>
    );
  }

  return null;
};

export default SupabaseInitializer;
