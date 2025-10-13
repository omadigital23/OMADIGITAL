# 🔐 Security Policy

## Overview

This document outlines security best practices, credential management, and vulnerability reporting for the OMA Digital platform.

## Table of Contents

- [Credential Management](#credential-management)
- [Environment Variables](#environment-variables)
- [Vertex AI Authentication](#vertex-ai-authentication)
- [Security Scanning](#security-scanning)
- [Production Deployment](#production-deployment)
- [Vulnerability Reporting](#vulnerability-reporting)

---

## Credential Management

### ❌ Never Commit These Files

The following files contain sensitive credentials and **MUST NEVER** be committed to git:

- `.env.local`
- `.env.development.local`
- `.env.production.local`
- `vertex-ai-credentials.json`
- Any `*-credentials.json` files
- Certificate files: `*.pem`, `*.key`, `*.p12`, `*.pfx`

### ✅ Verify .gitignore

Ensure your `.gitignore` includes:

```gitignore
# Environment files
.env.local
.env.development.local
.env.production.local

# Credentials
vertex-ai-credentials.json
*-credentials.json
service-account*.json

# Certificates
*.pem
*.key
*.p12
*.pfx
certificates/
```

### 🔍 Check for Tracked Secrets

Run this command to verify no secrets are tracked:

```bash
git ls-files | grep -E '\.(env\.local|pem|key|credentials\.json)$'
```

If any files appear, remove them immediately:

```bash
git rm --cached <filename>
git commit -m "Remove sensitive file from tracking"
```

---

## Environment Variables

### Server-Side Only (Never Expose to Browser)

These variables are **ONLY** accessible in API routes and `getServerSideProps`:

- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `JWT_SECRET` - Token signing key
- `ADMIN_PASSWORD_HASH` - Admin authentication
- `CRON_AUTH_TOKEN` - Scheduled job authentication
- `GOOGLE_APPLICATION_CREDENTIALS` - Vertex AI service account path

### Client-Side (Public)

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key (RLS protected)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_BASE_URL` - Application base URL

### Setup Instructions

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials** in `.env.local`

3. **Never commit** `.env.local` to git

---

## Vertex AI Authentication

### 🚨 Critical Requirement

This project uses **100% Vertex AI** for all AI functionality:
- ✅ Vertex AI Gemini (LLM)
- ✅ Vertex AI Speech-to-Text (STT)
- ✅ Vertex AI Text-to-Speech (TTS)

**Prohibited:**
- ❌ Google AI Studio (AI Studio Gemini)
- ❌ Hugging Face
- ❌ Local language detection heuristics

### Service Account Setup

1. **Create a GCP Service Account:**
   - Go to [GCP Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Name: `vertex-ai-service-account`

2. **Grant Required Roles:**
   - Vertex AI User
   - Cloud Speech Administrator
   - Cloud Text-to-Speech Administrator

3. **Create and Download Key:**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key" → JSON
   - Save as `vertex-ai-credentials.json` in project root

4. **Configure Environment:**
   ```bash
   # .env.local
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-credentials.json
   GOOGLE_CLOUD_PROJECT=your-gcp-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

5. **Enable Required APIs:**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable speech.googleapis.com
   gcloud services enable texttospeech.googleapis.com
   ```

### Production Deployment

For production deployment:

1. **Convert JSON to Base64:**
   ```bash
   cat vertex-ai-credentials.json | base64
   ```

2. **Add Environment Variables:**
   - Variable name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: The base64 string from step 1

3. **Add other required variables:**
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_CLOUD_LOCATION`
   - All other non-NEXT_PUBLIC_ variables from `.env.example`

---

## Security Scanning

### Automated Secret Detection

Run the security scanner before every commit:

```bash
npm run security:scan
```

This script checks for:
- Hardcoded API keys
- AWS/GCP/Stripe credentials
- Bearer tokens
- JWT tokens
- Private keys in code
- Sensitive files tracked in git

### Pre-Commit Hook (Recommended)

Install the pre-commit hook to automatically scan before commits:

```bash
# Create .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run security:scan
EOF

chmod +x .git/hooks/pre-commit
```

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Security Scan
  run: npm run security:scan
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All secrets configured in production environment variables
- [ ] `vertex-ai-credentials.json` NOT in git history
- [ ] `.env.local` NOT in git history
- [ ] Security scan passes: `npm run security:scan`
- [ ] TypeScript strict mode enabled
- [ ] ESLint passes with no warnings
- [ ] All tests pass
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting enabled on API routes

### Security Headers

The following security headers are configured in `next.config.js`:

```javascript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
```

### Supabase RLS (Row Level Security)

All database tables **MUST** have RLS policies enabled:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Vulnerability Reporting

### Reporting a Security Issue

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, email: **security@omadigital.sn**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours:** Initial acknowledgment
- **72 hours:** Preliminary assessment
- **7 days:** Patch development and testing
- **14 days:** Public disclosure (after fix deployed)

### Security Updates

Subscribe to security updates:
- Watch this repository for security advisories
- Follow [@OMADigital](https://twitter.com/OMADigital) on Twitter

---

## Best Practices

### Code Review

- Never approve PRs with hardcoded secrets
- Verify `.env.example` is updated for new variables
- Check that new API routes validate input
- Ensure new database queries use parameterized statements

### Dependency Management

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically (if possible)
npm audit fix

# Review and fix manually
npm audit fix --force
```

### Regular Security Tasks

- [ ] **Weekly:** Run `npm audit` and update dependencies
- [ ] **Monthly:** Rotate admin credentials
- [ ] **Quarterly:** Review and rotate API keys
- [ ] **Annually:** Full security audit

---

## Compliance

### WCAG 2.1 AA

All UI components must meet WCAG 2.1 AA accessibility standards:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Sufficient color contrast (4.5:1 minimum)

### Data Protection

- User data encrypted at rest (Supabase)
- HTTPS for all connections
- No PII in logs or error messages
- GDPR-compliant data deletion

---

## Contact

For security questions or concerns:
- **Email:** security@omadigital.sn
- **Documentation:** [API_CREDENTIALS_USAGE.md](./API_CREDENTIALS_USAGE.md)

---

**Last Updated:** 2025-01-13  
**Version:** 2.0.0
