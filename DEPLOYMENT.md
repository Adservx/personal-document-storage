# SecureDoc Manager - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase project configured
- Domain name (for custom domain deployment)

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
Create production environment file:
```bash
# .env.production
REACT_APP_SUPABASE_URL=your-production-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
REACT_APP_APP_NAME=SecureDoc Manager
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
```

### 2. Supabase Configuration
- ✅ Run `supabase-setup.sql` in production database
- ✅ Configure RLS policies
- ✅ Set up storage bucket with proper permissions
- ✅ Configure authentication providers
- ✅ Enable audit logging

### 3. Security Configuration
- ✅ Enable HTTPS
- ✅ Configure CORS policies in Supabase
- ✅ Set up proper authentication redirects
- ✅ Review and tighten RLS policies
- ✅ Enable database backups

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Add all environment variables from `.env.production`
   - Redeploy after adding variables

### Option 2: Netlify

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop `build/` folder to Netlify
   - Or connect GitHub repository for auto-deployment

3. **Configure Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all production environment variables

### Option 3: Traditional Hosting

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload contents of `build/` folder to web server
   - Configure web server for SPA routing

3. **Web Server Configuration**

   **Apache (.htaccess)**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

   **Nginx**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## 🔒 Security Hardening

### 1. Content Security Policy
Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
">
```

### 2. Security Headers
Configure web server to include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 3. Supabase Security
- Enable email confirmation
- Set session timeout
- Configure password policies
- Enable 2FA for admin accounts

## 📊 Monitoring and Analytics

### 1. Error Tracking
Integrate with error tracking service:
```javascript
// Add to src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.REACT_APP_ENVIRONMENT,
});
```

### 2. Performance Monitoring
- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Set up uptime monitoring

### 3. Analytics
- Google Analytics 4 integration
- Supabase analytics for database metrics
- Custom event tracking for user actions

## 🚦 Health Checks

### Application Health
Monitor these endpoints/features:
- ✅ Authentication flow
- ✅ Document upload/download
- ✅ Database connectivity
- ✅ Storage bucket access

### Database Health
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check storage policies
SELECT * FROM storage.objects_policies;

-- Check audit logs
SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours';
```

## 📝 Post-Deployment Tasks

### 1. Verify Functionality
- [ ] User registration and login
- [ ] Document upload and storage
- [ ] File download and sharing
- [ ] Search and filtering
- [ ] Mobile responsiveness

### 2. Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure CDN (if applicable)
- [ ] Optimize image loading
- [ ] Enable browser caching

### 3. Backup Strategy
- [ ] Daily database backups
- [ ] Storage bucket backup
- [ ] Environment configuration backup
- [ ] Test backup restoration

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - run: npm run test
    - uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- Monthly security updates
- Database performance monitoring
- Storage usage monitoring
- User feedback review

### Emergency Procedures
- Database rollback procedures
- Security incident response
- Service restoration checklist
- Communication protocols

---

**Need help with deployment? Check the main README.md or open an issue on GitHub.**