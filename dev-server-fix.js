#!/usr/bin/env node

/**
 * Script de diagnostic et correction du serveur de développement
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');

console.log('🔧 DIAGNOSTIC SERVEUR DÉVELOPPEMENT');
console.log('===================================\n');

async function killExistingProcesses() {
  console.log('🔍 Vérification des processus Node existants...');
  
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq node.exe"', (error, stdout) => {
      if (stdout.includes('node.exe')) {
        console.log('🛑 Processus Node détectés, nettoyage...');
        exec('taskkill /F /IM node.exe', (killError) => {
          if (killError) {
            console.log('⚠️ Impossible de tuer les processus (normal si aucun)');
          } else {
            console.log('✅ Processus Node nettoyés');
          }
          resolve();
        });
      } else {
        console.log('✅ Aucun processus Node en cours');
        resolve();
      }
    });
  });
}

async function checkPort3000() {
  console.log('🔍 Vérification du port 3000...');
  
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :3000', (error, stdout) => {
      if (stdout.trim()) {
        console.log('⚠️ Port 3000 occupé:', stdout.trim());
        // Essayer de libérer le port
        const lines = stdout.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              exec(`taskkill /F /PID ${pid}`, () => {
                console.log(`🛑 Processus ${pid} terminé`);
              });
            }
          }
        }
      } else {
        console.log('✅ Port 3000 libre');
      }
      resolve();
    });
  });
}

async function checkConfiguration() {
  console.log('🔍 Vérification configuration...');
  
  const issues = [];
  
  // Vérifier les fichiers problématiques
  if (fs.existsSync('babel.config.js')) {
    issues.push('babel.config.js cause des conflits avec SWC');
  }
  
  if (fs.existsSync('sentry.server.config.ts')) {
    issues.push('sentry.server.config.ts doit être dans instrumentation.ts');
  }
  
  // Vérifier .env.local
  if (!fs.existsSync('.env.local')) {
    issues.push('.env.local manquant');
  }
  
  if (issues.length > 0) {
    console.log('⚠️ Problèmes détectés:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ Configuration correcte');
  }
  
  return issues.length === 0;
}

async function startDevServer() {
  console.log('🚀 Démarrage du serveur de développement...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Timeout pour détecter si le serveur se bloque
  const timeout = setTimeout(() => {
    console.log('⚠️ Le serveur semble bloqué après 30 secondes');
    console.log('🔧 Tentative de redémarrage...');
    devProcess.kill('SIGINT');
    
    // Redémarrage après nettoyage
    setTimeout(() => {
      console.log('🔄 Redémarrage...');
      startDevServer();
    }, 2000);
  }, 30000);
  
  devProcess.on('exit', (code) => {
    clearTimeout(timeout);
    if (code !== 0) {
      console.log(`❌ Serveur arrêté avec le code ${code}`);
    }
  });
  
  // Détecter le message "Ready"
  devProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready in')) {
      clearTimeout(timeout);
      console.log('✅ Serveur prêt et fonctionnel !');
    }
  });
}

async function main() {
  try {
    await killExistingProcesses();
    await checkPort3000();
    const configOk = await checkConfiguration();
    
    if (!configOk) {
      console.log('🔧 Corrigez les problèmes de configuration avant de continuer');
      return;
    }
    
    console.log(''); // Ligne vide
    await startDevServer();
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

if (require.main === module) {
  main();
}