'use client';

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
  ssr: false,
});

const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'), {
  ssr: false,
});

export default function ClientLayoutEnhancements() {
  return (
    <>
      <GoogleAnalytics />
      <ChatWidget />
    </>
  );
}
