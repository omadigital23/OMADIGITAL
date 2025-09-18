import React from 'react';
import Head from 'next/head';
import { AdminChatbotSessions } from '../../src/components/AdminChatbotSessions';

export default function TestChatbotPage() {
  return (
    <>
      <Head>
        <title>Test Chatbot Sessions - OMA Digital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Test Chatbot Sessions</h1>
            <p className="text-gray-600 mt-2">Page de test pour vérifier l'affichage des conversations du chatbot</p>
          </div>
          
          <AdminChatbotSessions />
        </div>
      </div>
    </>
  );
}