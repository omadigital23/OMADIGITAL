import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import ProblemSolution from '@/components/sections/ProblemSolution';
import Services from '@/components/sections/Services';
import CaseStudies from '@/components/sections/CaseStudies';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import CTASection from '@/components/sections/CTASection';
import BlogPreview from '@/components/sections/BlogPreview';
import WhatsAppButton from '@/components/WhatsAppButton';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Services />
        <CaseStudies />
        <Testimonials />
        <Pricing />
        <CTASection />
        <BlogPreview />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
