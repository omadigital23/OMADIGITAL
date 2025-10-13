import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import VoiceChat from '../src/components/VoiceChat';

export default function VoiceChatPage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Assistant Vocal
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Interagissez avec notre assistant IA en utilisant votre voix. 
              Posez des questions et recevez des réponses audio en français.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <VoiceChat />
          </div>
          
          <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comment ça marche ?</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2">1</span>
                <span>Cliquez sur "Démarrer l'enregistrement" et parlez</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2">2</span>
                <span>Cliquez sur "Arrêter l'enregistrement" quand vous avez fini</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2">3</span>
                <span>L'assistant transcrit votre parole et vous répond vocalement</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
    },
  };
};