'use client'

import dynamic from 'next/dynamic'

const SmartChatbot = dynamic(() => import('../../components/chatbot/SmartChatbot'), { ssr: false })
const ScrollAnimations = dynamic(() => import('../../components/ScrollAnimations'), { ssr: false })

export default function HomePageClient() {
    return (
        <>
            <ScrollAnimations />
            <SmartChatbot />
        </>
    )
}
