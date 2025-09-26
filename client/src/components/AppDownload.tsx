import { useState, useEffect } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AppDownload() {
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isRunningStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast({
        title: 'Installation Not Available',
        description: 'To install this app, open it in your mobile browser and look for "Add to Home Screen" in the browser menu.',
        duration: 5000,
      });
      return;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: 'App Installing!',
          description: 'The app will appear on your home screen shortly.',
        });
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: 'Installation Error',
        description: 'Please try adding to home screen manually from your browser menu.',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center space-y-4">
          {/* Bold Title as requested */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            DOWNLODE APP
          </h2>
          
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Install our Excel RR Search app on your mobile device for quick access anytime, anywhere!
          </p>
          
          <div className="space-y-3">
            {isInstalled ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">App Already Installed!</span>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                data-testid="button-download-app"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Works on Android & iOS devices</p>
              <p>No app store required • Free forever</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}