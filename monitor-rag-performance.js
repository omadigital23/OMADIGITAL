/**
 * 📊 Script de Monitoring des Performances RAG - OMA Digital
 * Surveille la qualité des réponses et la performance du système RAG
 */

const { createClient } = require('@supabase/supabase-js');

class RAGPerformanceMonitor {
  constructor() {
    this.supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    this.supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    this.testQueries = [
      // Tests de base pour tous les services
      { message: "automatisation WhatsApp", language: "fr", service: "Automatisation", expectedDocs: 1 },
      { message: "gestion réseaux sociaux", language: "fr", service: "Social Media", expectedDocs: 1 },
      { message: "développement web", language: "fr", service: "Web Dev", expectedDocs: 1 },
      { message: "application mobile", language: "fr", service: "Mobile", expectedDocs: 1 },
      { message: "quels sont vos services", language: "fr", service: "Overview", expectedDocs: 2 },
      
      // Tests anglais
      { message: "AI automation", language: "en", service: "AI Auto (EN)", expectedDocs: 1 },
      { message: "mobile app development", language: "en", service: "Mobile (EN)", expectedDocs: 1 },
      
      // Tests de edge cases
      { message: "chatbot restaurant", language: "fr", service: "Specific Use", expectedDocs: 0 },
      { message: "prix services", language: "fr", service: "Pricing", expectedDocs: 0 }
    ];
  }

  async runPerformanceTest() {
    console.log('📊 RAG Performance Monitor - OMA Digital\n');
    console.log(`Début du test: ${new Date().toLocaleString()}`);
    console.log(`Nombre de requêtes: ${this.testQueries.length}\n`);

    const results = {
      totalQueries: this.testQueries.length,
      successfulRAG: 0,
      shortResponses: 0,
      highConfidence: 0,
      averageResponseTime: 0,
      averageResponseLength: 0,
      totalResponseTime: 0,
      details: []
    };

    for (const [index, query] of this.testQueries.entries()) {
      console.log(`${index + 1}/${this.testQueries.length} Testing: ${query.service}`);
      
      const startTime = Date.now();
      
      try {
        const response = await fetch('http://localhost:3000/api/chat/gemini-rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.message,
            language: query.language,
            sessionId: `monitor-${Date.now()}`
          })
        });

        const responseTime = Date.now() - startTime;
        results.totalResponseTime += responseTime;

        if (response.ok) {
          const data = await response.json();
          
          const metrics = {
            query: query.message,
            service: query.service,
            responseTime,
            responseLength: data.response.length,
            documentsUsed: data.documentsUsed,
            confidence: data.confidence,
            isShort: data.response.length <= 300,
            hasRAG: data.documentsUsed > 0,
            isHighConfidence: data.confidence >= 0.8
          };

          // Compter les succès
          if (metrics.hasRAG) results.successfulRAG++;
          if (metrics.isShort) results.shortResponses++;
          if (metrics.isHighConfidence) results.highConfidence++;

          results.details.push(metrics);
          
          const statusIcons = [
            metrics.hasRAG ? '✅' : '⚠️',
            metrics.isShort ? '✅' : '❌', 
            metrics.isHighConfidence ? '✅' : '⚠️'
          ].join(' ');
          
          console.log(`   ${statusIcons} ${responseTime}ms | ${data.response.length} chars | ${data.documentsUsed} docs | ${data.confidence}`);
          
        } else {
          console.log(`   ❌ API Error: ${response.status}`);
          results.details.push({
            query: query.message,
            service: query.service,
            error: `HTTP ${response.status}`
          });
        }
        
      } catch (error) {
        console.log(`   💥 Request failed: ${error.message}`);
        results.details.push({
          query: query.message,
          service: query.service,
          error: error.message
        });
      }
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculer les moyennes
    results.averageResponseTime = Math.round(results.totalResponseTime / results.totalQueries);
    results.averageResponseLength = Math.round(
      results.details
        .filter(d => d.responseLength)
        .reduce((sum, d) => sum + d.responseLength, 0) / 
      results.details.filter(d => d.responseLength).length
    );

    return results;
  }

  generateReport(results) {
    const ragSuccessRate = Math.round((results.successfulRAG / results.totalQueries) * 100);
    const shortResponseRate = Math.round((results.shortResponses / results.totalQueries) * 100);
    const confidenceRate = Math.round((results.highConfidence / results.totalQueries) * 100);

    console.log('\n📊 RAPPORT DE PERFORMANCE RAG');
    console.log('═'.repeat(50));
    console.log(`📈 RAG Success Rate: ${ragSuccessRate}% (${results.successfulRAG}/${results.totalQueries})`);
    console.log(`📏 Short Responses: ${shortResponseRate}% (${results.shortResponses}/${results.totalQueries})`);
    console.log(`🎯 High Confidence: ${confidenceRate}% (${results.highConfidence}/${results.totalQueries})`);
    console.log(`⏱️ Average Response Time: ${results.averageResponseTime}ms`);
    console.log(`📝 Average Response Length: ${results.averageResponseLength} characters`);

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (ragSuccessRate < 80) {
      console.log('   🔍 Améliorer la recherche RAG (mots-clés, indexation)');
    }
    if (shortResponseRate < 80) {
      console.log('   ✂️ Optimiser le prompt pour des réponses plus courtes');
    }
    if (confidenceRate < 80) {
      console.log('   📚 Enrichir la base de connaissances');
    }
    if (results.averageResponseTime > 3000) {
      console.log('   ⚡ Optimiser les performances API');
    }

    // Score global
    const globalScore = Math.round((ragSuccessRate + shortResponseRate + confidenceRate) / 3);
    console.log(`\n🏆 SCORE GLOBAL: ${globalScore}/100`);
    
    if (globalScore >= 85) {
      console.log('🎉 EXCELLENT - RAG Performance optimale !');
    } else if (globalScore >= 70) {
      console.log('✅ BON - Quelques améliorations possibles');
    } else {
      console.log('⚠️ MOYEN - Optimisations nécessaires');
    }

    return {
      timestamp: new Date().toISOString(),
      scores: { ragSuccessRate, shortResponseRate, confidenceRate, globalScore },
      metrics: results
    };
  }

  async saveReport(report) {
    try {
      const { data, error } = await this.supabase
        .from('rag_performance_reports')
        .insert([{
          created_at: report.timestamp,
          rag_success_rate: report.scores.ragSuccessRate,
          short_response_rate: report.scores.shortResponseRate,
          confidence_rate: report.scores.confidenceRate,
          global_score: report.scores.globalScore,
          details: report.metrics
        }]);

      if (error) {
        console.log('⚠️ Could not save report to database:', error.message);
      } else {
        console.log('✅ Report saved to database');
      }
    } catch (error) {
      console.log('⚠️ Database save failed:', error.message);
    }
  }
}

// Exécuter le monitoring
async function main() {
  const monitor = new RAGPerformanceMonitor();
  
  try {
    const results = await monitor.runPerformanceTest();
    const report = monitor.generateReport(results);
    await monitor.saveReport(report);
  } catch (error) {
    console.error('💥 Monitoring failed:', error);
  }
}

// Auto-exécution si appelé directement
if (require.main === module) {
  main();
}

module.exports = { RAGPerformanceMonitor };