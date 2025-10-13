#!/usr/bin/env node

/**
 * Security Secrets Scanner
 * 
 * Scans the codebase for hardcoded secrets, API keys, and credentials.
 * This script should be run before commits and in CI/CD pipelines.
 * 
 * @module security-secrets-scan
 * @requires fs
 * @requires path
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Secret patterns to detect in code
 * Each pattern includes regex, description, and severity
 */
const SECRET_PATTERNS = [
  // Google Cloud / Vertex AI
  {
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
    name: 'Google API Key',
    severity: 'CRITICAL',
  },
  {
    pattern: /"private_key":\s*"-----BEGIN PRIVATE KEY-----/g,
    name: 'GCP Service Account Private Key',
    severity: 'CRITICAL',
  },
  {
    pattern: /"type":\s*"service_account"/g,
    name: 'GCP Service Account JSON (potential)',
    severity: 'HIGH',
  },
  
  // AWS
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    name: 'AWS Access Key ID',
    severity: 'CRITICAL',
  },
  {
    pattern: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/g,
    name: 'AWS Secret Access Key',
    severity: 'CRITICAL',
  },
  
  // Stripe
  {
    pattern: /sk_(live|test)_[0-9a-zA-Z]{24,}/g,
    name: 'Stripe Secret Key',
    severity: 'CRITICAL',
  },
  {
    pattern: /pk_(live|test)_[0-9a-zA-Z]{24,}/g,
    name: 'Stripe Publishable Key',
    severity: 'MEDIUM',
  },
  
  // GitHub
  {
    pattern: /ghp_[0-9A-Za-z]{36,}/g,
    name: 'GitHub Personal Access Token',
    severity: 'CRITICAL',
  },
  {
    pattern: /gho_[0-9A-Za-z]{36,}/g,
    name: 'GitHub OAuth Token',
    severity: 'CRITICAL',
  },
  
  // Slack
  {
    pattern: /xox[baprs]-[A-Za-z0-9\-]{10,}/g,
    name: 'Slack Token',
    severity: 'HIGH',
  },
  
  // Twilio
  {
    pattern: /AC[0-9a-fA-F]{32}/g,
    name: 'Twilio Account SID',
    severity: 'HIGH',
  },
  
  // Generic patterns
  {
    pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
    name: 'Bearer Token',
    severity: 'HIGH',
  },
  {
    pattern: /[a-zA-Z0-9_-]*api[_-]?key[a-zA-Z0-9_-]*\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi,
    name: 'Generic API Key',
    severity: 'HIGH',
  },
  {
    pattern: /[a-zA-Z0-9_-]*secret[a-zA-Z0-9_-]*\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi,
    name: 'Generic Secret',
    severity: 'HIGH',
  },
  {
    pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    name: 'Hardcoded Password',
    severity: 'CRITICAL',
  },
  
  // JWT
  {
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    name: 'JWT Token',
    severity: 'HIGH',
  },
];

/**
 * Files and directories to exclude from scanning
 */
const EXCLUDED_PATHS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'out',
  '.git',
  'coverage',
  '.env.example',
  '.env.local.example',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'scripts/security-secrets-scan.js', // Exclude this file itself
  'vertex-ai-credentials.json', // Gitignored credential file
  'SECURITY.md', // Security documentation
  'SECURITY_HARDENING_COMPLETE.md', // Security documentation
  'docs/CERTIFICATE_MANAGEMENT.md', // Certificate documentation
];

/**
 * Documentation files that may contain example credentials
 * These are scanned but with lower severity
 */
const DOCUMENTATION_PATTERNS = [
  /\.md$/i,
  /README/i,
  /GUIDE/i,
  /SUMMARY/i,
  /INSTRUCTIONS/i,
  /SETUP/i,
  /MIGRATION/i,
];

/**
 * File extensions to scan
 */
const SCANNED_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.yml',
  '.yaml',
  '.md',
  '.txt',
];

/**
 * Check if a path should be excluded from scanning
 */
function shouldExclude(filePath) {
  return EXCLUDED_PATHS.some(excluded => filePath.includes(excluded));
}

/**
 * Check if a file is documentation (may contain example credentials)
 */
function isDocumentation(filePath) {
  return DOCUMENTATION_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if a file should be scanned based on its extension
 */
function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  return SCANNED_EXTENSIONS.includes(ext);
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (shouldExclude(filePath)) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (shouldScanFile(filePath)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Scan a file for secret patterns
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];
  const isDoc = isDocumentation(filePath);

  SECRET_PATTERNS.forEach(({ pattern, name, severity }) => {
    const matches = content.matchAll(pattern);
    
    for (const match of matches) {
      const lines = content.substring(0, match.index).split('\n');
      const lineNumber = lines.length;
      const lineContent = lines[lines.length - 1] + content.substring(match.index).split('\n')[0];
      
      // Skip if it's documentation and appears to be an example
      if (isDoc) {
        const lowerLine = lineContent.toLowerCase();
        if (lowerLine.includes('example') || 
            lowerLine.includes('your_') || 
            lowerLine.includes('placeholder') ||
            lowerLine.includes('template') ||
            lowerLine.includes('sample')) {
          continue;
        }
      }
      
      findings.push({
        file: filePath,
        line: lineNumber,
        pattern: name,
        severity,
        match: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
        lineContent: lineContent.trim().substring(0, 100),
      });
    }
  });

  return findings;
}

/**
 * Check if sensitive files are properly gitignored
 */
function checkGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    return {
      status: 'ERROR',
      message: '.gitignore file not found',
    };
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    '.env.local',
    '*.pem',
    '*.key',
    'vertex-ai-credentials.json',
    '*-credentials.json',
  ];

  const missing = requiredPatterns.filter(pattern => !gitignoreContent.includes(pattern));

  if (missing.length > 0) {
    return {
      status: 'WARNING',
      message: `Missing patterns in .gitignore: ${missing.join(', ')}`,
    };
  }

  return {
    status: 'OK',
    message: 'All required patterns present in .gitignore',
  };
}

/**
 * Check for tracked sensitive files in git
 */
function checkGitTrackedFiles() {
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
    const sensitivePatterns = [
      /\.env\.local$/,
      /\.pem$/,
      /\.key$/,
      /credentials\.json$/,
      /service-account.*\.json$/,
    ];

    const trackedSensitive = trackedFiles.filter(file => 
      sensitivePatterns.some(pattern => pattern.test(file))
    );

    if (trackedSensitive.length > 0) {
      return {
        status: 'ERROR',
        message: `Sensitive files tracked in git: ${trackedSensitive.join(', ')}`,
        files: trackedSensitive,
      };
    }

    return {
      status: 'OK',
      message: 'No sensitive files tracked in git',
    };
  } catch (error) {
    return {
      status: 'WARNING',
      message: 'Could not check git tracked files (not a git repository?)',
    };
  }
}

/**
 * Main scan function
 */
function runSecurityScan() {
  console.log(`${colors.bold}${colors.cyan}🔐 Security Secrets Scanner${colors.reset}\n`);
  
  const rootDir = process.cwd();
  console.log(`Scanning directory: ${rootDir}\n`);

  // Check .gitignore
  console.log(`${colors.bold}Checking .gitignore...${colors.reset}`);
  const gitignoreCheck = checkGitignore();
  const gitignoreColor = gitignoreCheck.status === 'OK' ? colors.green : 
                         gitignoreCheck.status === 'WARNING' ? colors.yellow : colors.red;
  console.log(`${gitignoreColor}${gitignoreCheck.status}: ${gitignoreCheck.message}${colors.reset}\n`);

  // Check git tracked files
  console.log(`${colors.bold}Checking git tracked files...${colors.reset}`);
  const gitCheck = checkGitTrackedFiles();
  const gitColor = gitCheck.status === 'OK' ? colors.green : 
                   gitCheck.status === 'WARNING' ? colors.yellow : colors.red;
  console.log(`${gitColor}${gitCheck.status}: ${gitCheck.message}${colors.reset}\n`);

  // Scan files
  console.log(`${colors.bold}Scanning files for secrets...${colors.reset}`);
  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} files to scan\n`);

  let allFindings = [];
  files.forEach(file => {
    const findings = scanFile(file);
    allFindings = allFindings.concat(findings);
  });

  // Group findings by severity
  const critical = allFindings.filter(f => f.severity === 'CRITICAL');
  const high = allFindings.filter(f => f.severity === 'HIGH');
  const medium = allFindings.filter(f => f.severity === 'MEDIUM');

  // Display results
  console.log(`${colors.bold}Scan Results:${colors.reset}`);
  console.log(`${colors.red}CRITICAL: ${critical.length}${colors.reset}`);
  console.log(`${colors.yellow}HIGH: ${high.length}${colors.reset}`);
  console.log(`${colors.blue}MEDIUM: ${medium.length}${colors.reset}\n`);

  if (allFindings.length > 0) {
    console.log(`${colors.bold}${colors.red}⚠️  SECRETS DETECTED${colors.reset}\n`);
    
    [critical, high, medium].forEach(findings => {
      if (findings.length > 0) {
        const severity = findings[0].severity;
        const color = severity === 'CRITICAL' ? colors.red : 
                     severity === 'HIGH' ? colors.yellow : colors.blue;
        
        console.log(`${color}${colors.bold}${severity} Findings:${colors.reset}`);
        findings.forEach(finding => {
          console.log(`  ${finding.file}:${finding.line}`);
          console.log(`    Pattern: ${finding.pattern}`);
          console.log(`    Match: ${finding.match}`);
          console.log(`    Line: ${finding.lineContent}`);
          console.log('');
        });
      }
    });

    console.log(`${colors.red}${colors.bold}❌ Security scan FAILED${colors.reset}`);
    console.log(`${colors.yellow}Action required: Remove hardcoded secrets and use environment variables${colors.reset}\n`);
    
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✅ No secrets detected${colors.reset}\n`);
    
    if (gitignoreCheck.status !== 'OK' || gitCheck.status === 'ERROR') {
      console.log(`${colors.yellow}⚠️  Warnings detected - please review${colors.reset}\n`);
      process.exit(1);
    }
    
    console.log(`${colors.green}${colors.bold}✅ Security scan PASSED${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the scan
runSecurityScan();
