import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhatsAppChannelButton() {
  return (
    <Button
      asChild
      className="bg-green-600 hover:bg-green-700 text-white whatsapp-pulse-ring"
      data-testid="button-whatsapp-channel"
    >
      <a
        href="https://whatsapp.com/channel/0029Vb6YV2qKWEKlKjsNEZ3h"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Join Channel</span>
        <span className="sm:hidden">Join</span>
      </a>
    </Button>
  );
}
