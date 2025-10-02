import { Download, Smartphone, BookOpen, Calculator, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WebAppDownloadSection() {
  const apps = [
    {
      title: 'ಶಿಕ್ಷಕ ಸಹಾಯಕ ಆ್ಯಪ್',
      description: 'Teachers utility tools and resources',
      icon: BookOpen,
      link: 'https://www.kspstadk.com',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'ವಿದ್ಯಾರ್ಥಿ ಟೂಲ್ಸ್',
      description: 'Educational apps for students',
      icon: Calculator,
      link: 'https://www.kspstadk.com',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'ಡಾಕ್ಯುಮೆಂಟ್ ಟೂಲ್ಸ್',
      description: 'Document management utilities',
      icon: FileText,
      link: 'https://www.kspstadk.com',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'ಮೊಬೈಲ್ ಆ್ಯಪ್ಸ್',
      description: 'Mobile applications',
      icon: Smartphone,
      link: 'https://www.kspstadk.com',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="mt-12 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
            ಶಿಕ್ಷಕರಿಗೆ ಹಾಗೂ ಮಕ್ಕಳಿಗೆ ಉಪಯುಕ್ತ ಆ್ಯಪ್ DOWNLODE ಮಾಡಿ
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-blue-700 dark:text-blue-300 mt-2">
            Useful Apps for Teachers and Students - Download Now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {apps.map((app, index) => {
              const Icon = app.icon;
              return (
                <Card
                  key={index}
                  className="hover-elevate transition-all duration-300"
                  data-testid={`card-app-${index}`}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${app.color} flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg mb-2 text-foreground line-clamp-2">
                      {app.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {app.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className={`w-full bg-gradient-to-r ${app.color} hover:shadow-lg text-xs sm:text-sm`}
                      data-testid={`button-download-${index}`}
                    >
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">Download</span>
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              data-testid="button-visit-kspstadk"
            >
              <a
                href="https://www.kspstadk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Visit KSPSTADK.com for More Apps</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
