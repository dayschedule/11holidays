'use client';

import { useEffect } from 'react';

export function AdsBlock() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8402459453084519"
        data-ad-slot="3130208712"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
