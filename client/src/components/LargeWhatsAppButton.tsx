import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LargeWhatsAppButton() {
  return (
    <div className="mt-6 mb-6">
      <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="flex justify-center py-4 sm:py-6">
          <Button
            asChild
            className="text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-6 h-auto text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whatsapp-strong-blink"
            style={{ backgroundColor: '#25D366' }}
            data-testid="button-whatsapp-large"
          >
            <a
              href="https://whatsapp.com/channel/0029Vb6YV2qKWEKlKjsNEZ3h"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-4"
            >
              <MessageCircle className="w-5 h-5 sm:w-8 sm:h-8" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-left">Join Our WhatsApp Channel</span>
                <span className="text-xs font-normal opacity-90">Get updates and support</span>
              </div>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
