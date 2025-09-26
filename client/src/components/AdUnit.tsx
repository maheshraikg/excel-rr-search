import { useEffect, useRef } from 'react';

interface AdUnitProps {
  adSlot: string; // Required slot ID
  adFormat?: 'auto' | 'fluid';
  className?: string;
  style?: React.CSSProperties;
}

export default function AdUnit({ adSlot, adFormat = 'auto', className = '', style }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasBeenPushed = useRef(false);

  useEffect(() => {
    const element = adRef.current;
    if (!hasBeenPushed.current && element && element.getAttribute('data-adsbygoogle-status') !== 'done') {
      try {
        // Push the ad for rendering only once
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        hasBeenPushed.current = true;
      } catch (error) {
        console.log('AdSense error:', error);
      }
    }
  }, []);

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7493749229509232"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-adtest={isDevelopment ? 'on' : undefined}
      />
    </div>
  );
}

// Ad placement component for strategic locations  
export function AdBanner({ className = '' }: { className?: string }) {
  // Use environment variables for production, fallback for development
  const adSlot = import.meta.env.VITE_ADSENSE_SLOT_BANNER || '1234567890';
  
  return (
    <div className={`my-4 text-center ${className}`} style={{ minHeight: '90px' }}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <AdUnit 
        adSlot={adSlot} 
        adFormat="auto" 
        className="max-w-full"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
}

// Rectangle ad for sidebar or between content
export function AdRectangle({ className = '' }: { className?: string }) {
  // Use environment variables for production, fallback for development
  const adSlot = import.meta.env.VITE_ADSENSE_SLOT_RECTANGLE || '9876543210';
  
  return (
    <div className={`my-4 text-center ${className}`} style={{ minHeight: '280px' }}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <AdUnit 
        adSlot={adSlot} 
        adFormat="auto" 
        className="mx-auto"
        style={{ minHeight: '280px', maxWidth: '336px' }}
      />
    </div>
  );
}