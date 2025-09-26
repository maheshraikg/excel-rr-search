import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Section */}
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                ಇದೆ ರೀತಿಯ Tool ನಿಮಗೆ ಬೇಕಿದಲ್ಲಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Need similar tools? Contact us for custom solutions
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  asChild
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-whatsapp-contact"
                >
                  <a 
                    href="https://wa.me/your-number" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Us
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900 animated-button"
                  data-testid="button-more-info"
                >
                  <a 
                    href="https://www.Kspstadk.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    ✨ ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>© 2025</span>
            <a 
              href="https://www.Kspstadk.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.Kspstadk.com
            </a>
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for All</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Excel Data Search Tool - Empowering Data Access for Everyone
          </div>
        </div>
      </div>
    </footer>
  );
}