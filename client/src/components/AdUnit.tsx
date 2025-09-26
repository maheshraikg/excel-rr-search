import { useEffect, useRef } from 'react';

interface AdUnitProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'vertical';
  className?: string;
}

export default function AdUnit({ adSlot, adFormat = 'auto', className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Push the ad for rendering
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, []);

  // Auto ads will handle placement automatically, but we can also add manual units
  if (adFormat === 'auto') {
    return null; // Auto ads are handled by the main script
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7493749229509232"
        data-ad-slot={adSlot}
        data-ad-format={adFormat === 'banner' ? 'banner' : adFormat === 'rectangle' ? 'rectangle' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Ad placement component for strategic locations
export function AdBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 text-center ${className}`}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <AdUnit adFormat="banner" className="max-w-full" />
    </div>
  );
}

// Rectangle ad for sidebar or between content
export function AdRectangle({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 text-center ${className}`}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <AdUnit adFormat="rectangle" className="mx-auto" />
    </div>
  );
}