import { Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WebAppDownloadSection() {
  return (
    <div className="mt-12 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
            ಶಿಕ್ಷಕರಿಗೆ ಹಾಗೂ ಮಕ್ಕಳಿಗೆ ಉಪಯುಕ್ತ ಆ್ಯಪ್ DOWNLODE ಮಾಡಿ
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-blue-700 dark:text-blue-300 mt-2">
            Useful Apps for Teachers and Students - Download Now
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button
            asChild
            size="lg"
            className="text-lg sm:text-2xl px-8 sm:px-16 py-6 sm:py-8 h-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 btn-blink"
            data-testid="button-download-apps"
          >
            <a
              href="https://www.kspstadk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4"
            >
              <Download className="w-6 h-6 sm:w-10 sm:h-10" />
              <span className="font-bold">Download Educational Apps</span>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
