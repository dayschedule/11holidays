import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function AdsBlock({ slot = '3130208712', className }: { slot?: string; className?: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    // min-height reserves space for the ad to limit layout shift above the fold
    <div className={cn('no-print min-h-[100px]', className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8402459453084519"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
