import { Share2, Copy, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  SiWhatsapp, 
  SiFacebook, 
  SiX, 
  SiLinkedin, 
  SiTelegram,
  SiInstagram 
} from 'react-icons/si';

export default function SocialMediaSharing() {
  const { toast } = useToast();
  const appUrl = window.location.origin;
  const appTitle = 'Excel RR Number Search App';
  const appDescription = 'Search and analyze Excel data by RR numbers instantly! Fast, secure data lookup tool for survey and institutional data.';

  const shareData = {
    title: appTitle,
    text: appDescription,
    url: appUrl,
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: SiWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`,
    },
    {
      name: 'Facebook',
      icon: SiFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    },
    {
      name: 'Twitter',
      icon: SiX,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
    },
    {
      name: 'LinkedIn',
      icon: SiLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    },
    {
      name: 'Telegram',
      icon: SiTelegram,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: 'Instagram',
      icon: SiInstagram,
      color: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
      textColor: 'text-white',
      url: '#', // Instagram doesn't support direct URL sharing
    },
  ];

  const handleShare = async (platform: typeof socialPlatforms[0]) => {
    if (platform.name === 'Instagram') {
      toast({
        title: 'Instagram Sharing',
        description: 'Please copy the link and share it manually on Instagram.',
        duration: 4000,
      });
      return;
    }

    window.open(platform.url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: 'Link Copied!',
        description: 'App URL has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground" data-testid="heading-share-app">
            Share This App
          </h2>
          
          <p className="text-sm text-muted-foreground">
            Help others discover this useful Excel search tool!
          </p>
          
          {/* Social Media Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className={`${platform.color} ${platform.textColor} shadow-lg flex flex-col items-center gap-2`}
                  size="lg"
                  data-testid={`button-share-${platform.name.toLowerCase()}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </Button>
              );
            })}
          </div>
          
          {/* Additional Sharing Options */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-native-share"
            >
              <Share2 className="w-4 h-4" />
              More Options
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-copy-link"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Heart className="w-3 h-3" />
            <p>Spread the word about this free Excel search tool!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}