#!/usr/bin/env node

/**
 * Security Audit Script
 * Regularly audit for hardcoded secrets in the codebase
 */

const fs = require('fs');
const path = require('path');

// Patterns to search for potential secrets
const SECRET_PATTERNS = [
  { name: 'Google API Keys', pattern: /AIza[A-Za-z0-9_-]{30,}/g },
  { name: 'Supabase Keys', pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[A-Za-z0-9_-]{50,}/g },
  { name: 'Make.com Webhooks', pattern: /https:\/\/hook\.us2\.make\.com\/[A-Za-z0-9_-]{30,}/g },
  { name: 'Generic API Keys', pattern: /(?:api[_-]?key|API[_-]?KEY)["']?[\s:=]+["']?[A-Za-z0-9_-]{20,}/gi },
  { name: 'Passwords', pattern: /(?:password|passwd|pwd)["']?[\s:=]+["']?[A-Za-z0-9@#$%^&*()_+-=]{8,}/gi },
  { name: 'Tokens', pattern: /(?:token|TOKEN)["']?[\s:=]+["']?[A-Za-z0-9_-]{20,}/gi },
  { name: 'Secrets', pattern: /(?:secret|SECRET)["']?[\s:=]+["']?[A-Za-z0-9_-]{20,}/gi }
];

// File extensions to check
const FILE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.sql', '.md', '.env'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', '.vscode', 'coverage'];

// Files to exclude
const EXCLUDE_FILES = ['.env.local', '.env.development.local', '.env.production.local'];

function shouldExcludeFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  // Check if file is in excluded directory
  for (const excludeDir of EXCLUDE_DIRS) {
    if (dirName.includes(excludeDir)) {
      return true;
    }
  }
  
  // Check if file is excluded
  return EXCLUDE_FILES.includes(fileName);
}

function shouldCheckFile(filePath) {
  const ext = path.extname(filePath);
  return FILE_EXTENSIONS.includes(ext) && !shouldExcludeFile(filePath);
}

function searchFileForSecrets(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    for (const { name, pattern } of SECRET_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          type: name,
          matches: [...new Set(matches)] // Remove duplicates
        });
      }
    }
    
    return findings;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function searchDirectory(directory) {
  let allFindings = [];
  
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!EXCLUDE_DIRS.includes(item)) {
            allFindings = allFindings.concat(searchDirectory(fullPath));
          }
        } else if (stat.isFile() && shouldCheckFile(fullPath)) {
          const findings = searchFileForSecrets(fullPath);
          if (findings.length > 0) {
            allFindings.push({
              file: fullPath,
              findings
            });
          }
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
  }
  
  return allFindings;
}

function runSecurityAudit() {
  console.log('🔍 Running security audit for hardcoded secrets...\n');
  
  const findings = searchDirectory('.');
  
  if (findings.length === 0) {
    console.log('✅ No potential hardcoded secrets found!');
    return;
  }
  
  console.log(`⚠️  Found ${findings.length} files with potential hardcoded secrets:\n`);
  
  for (const { file, findings: fileFindings } of findings) {
    console.log(`📁 ${file}:`);
    for (const { type, matches } of fileFindings) {
      console.log(`  🔑 ${type}: ${matches.length} potential match(es)`);
      for (const match of matches) {
        console.log(`    - ${match.substring(0, 50)}${match.length > 50 ? '...' : ''}`);
      }
    }
    console.log('');
  }
  
  console.log('💡 Recommendation: Review the files above and replace hardcoded values with environment variables.');
}

// Run the audit
if (require.main === module) {
  runSecurityAudit();
}

module.exports = { runSecurityAudit };