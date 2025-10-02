import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LargeWhatsAppButton() {
  return (
    <div className="mt-8 mb-8">
      <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="flex justify-center py-8">
          <Button
            asChild
            size="lg"
            className="text-xl sm:text-3xl px-10 sm:px-20 py-8 sm:py-12 h-auto text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 whatsapp-strong-blink"
            style={{ backgroundColor: '#25D366' }}
            data-testid="button-whatsapp-large"
          >
            <a
              href="https://whatsapp.com/channel/0029Vb6YV2qKWEKlKjsNEZ3h"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 sm:gap-6"
            >
              <MessageCircle className="w-8 h-8 sm:w-14 sm:h-14" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-left">Join Our WhatsApp Channel</span>
                <span className="text-xs sm:text-sm font-normal opacity-90">Get updates and support</span>
              </div>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
