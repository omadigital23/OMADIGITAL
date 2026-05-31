'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
  ssr: false,
});

const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'), {
  ssr: false,
});

export default function ClientLayoutEnhancements() {
  useEffect(() => {
    document.documentElement.dataset.omaHydrated = 'true';

    return () => {
      delete document.documentElement.dataset.omaHydrated;
    };
  }, []);

  return (
    <>
      <GoogleAnalytics />
      <ChatWidget />
    </>
  );
}
