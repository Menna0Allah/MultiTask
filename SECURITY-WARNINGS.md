# 🔐 SECURITY WARNINGS AND REQUIRED FIXES

**CRITICAL:** This document outlines serious security issues that must be addressed before deploying to production.

---

## 🚨 CRITICAL ISSUES

### 1. **Environment Files Committed to Git**
**Risk Level:** 🔴 **CRITICAL**
**Issue:** Your `.env` files containing real API keys and secrets are tracked in git history.

**Exposed Credentials:**
- `GEMINI_API_KEY=AIzaSyA781KGAf5MejFdmWgGBkUksvP1-buZ3uA`
- `GOOGLE_CLIENT_ID=918215953444-6th8qm8bdm9bucgukt61v2b1ucsvpbf3.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=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`
- Database password: `annem`

**Immediate Actions Required:**
```bash
# 1. Remove from git tracking (but keep local files)
git rm --cached backend/.env frontend/.env

# 2. Add to .gitignore (already done)
# .env files are already in .gitignore

# 3. Commit the removal
git add .gitignore
git commit -m "Remove .env files from version control"

# 4. CRITICAL: Rotate ALL API keys and secrets
# - Generate new GEMINI_API_KEY at https://makersuite.google.com/app/apikey
# - Generate new Google OAuth credentials at https://console.cloud.google.com/
# - Generate new SECRET_KEY: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# - Change database password

# 5. Update .env files with new credentials
```

**Note:** Anyone with access to your git history can still see these keys. Consider:
- Rotating all exposed credentials immediately
- Using `git filter-branch` or BFG Repo-Cleaner to remove from git history (advanced)

---

### 2. **Database Password Exposed**
**Risk Level:** 🔴 **CRITICAL**
**Issue:** Database password `annem` is weak and exposed in committed .env file.

**Fix:**
```bash
# 1. Change PostgreSQL password
psql -U postgres
ALTER USER multitask_db_user WITH PASSWORD 'new-strong-password-here';

# 2. Update backend/.env
DATABASE_PASSWORD=new-strong-password-here
```

---

### 3. **Django SECRET_KEY Previously Insecure**
**Risk Level:** 🟡 **FIXED** (but old key in git history)
**Status:** Fixed in latest commit, but old insecure key is in git history.

**Old Key (EXPOSED):**
`django-insecure-m&vblbp6(q9ziu@%93(k@k^$*38+^^1fqr1^u%h@v=*+f^2a_o`

**New Key (CURRENT):**
`a^Lz47)Uf-r\0Pmtjf+Dy-Mdo^*IrtMGhpp=h8JgS14@Tc0C1#`

**Impact:** Anyone with old key could forge session cookies or decrypt signed data.

**Action:** Key has been regenerated. Ensure old sessions are invalidated.

---

## ⚠️ HIGH PRIORITY ISSUES

### 4. **ALLOWED_HOSTS Wildcard (FIXED)**
**Risk Level:** 🟢 **RESOLVED**
**Previous Issue:** `ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']`
**Fixed To:** `ALLOWED_HOSTS = ['localhost', '127.0.0.1'] if DEBUG else [config('ALLOWED_HOST')]`

**For Production:** Add your domain to `.env`:
```bash
ALLOWED_HOST=yourdomain.com
```

---

### 5. **Debug Mode in Production**
**Risk Level:** 🟠 **MEDIUM** (if deployed)
**Current:** `DEBUG=True` in `.env`

**For Production:**
```bash
# In production .env file
DEBUG=False
```

**Warning:** Never deploy with `DEBUG=True` - it exposes:
- Full error tracebacks with code
- SQL queries
- Environment variables
- Internal file paths

---

### 6. **API Keys with Broad Permissions**
**Risk Level:** 🟠 **MEDIUM**
**Issue:** Google OAuth and Gemini API keys may have unnecessary permissions.

**Recommendations:**
1. Review Google OAuth scopes (currently: profile, email)
2. Restrict API keys to specific domains/IP addresses
3. Set up usage quotas and alerts
4. Enable API key restrictions in Google Cloud Console

---

## 📋 MEDIUM PRIORITY ISSUES

### 7. **CORS Configuration**
**Risk Level:** 🟡 **LOW-MEDIUM**
**Current:** Allows `localhost:5173` and `localhost:3000`

**For Production:**
- Update `settings.py` CORS_ALLOWED_ORIGINS to include production frontend URL
- Remove development URLs in production

---

### 8. **Email Backend**
**Risk Level:** 🟢 **INFORMATIONAL**
**Current:** `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'`

**For Production:** Configure real SMTP server (Gmail, SendGrid, etc.)

---

### 9. **No Rate Limiting on Auth Endpoints**
**Risk Level:** 🟡 **LOW-MEDIUM**
**Issue:** Login/register endpoints could be brute-forced.

**Recommendation:** Implement stricter rate limiting for auth endpoints:
```python
# In settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'auth': '5/minute',  # Add this for login/register
    }
}
```

---

### 10. **WebSocket Authentication**
**Risk Level:** 🟡 **LOW**
**Status:** Properly implemented with JWT via query string

**Note:** Tokens in query strings are logged by proxies. Consider:
- Using secure WebSocket cookies
- Implementing token rotation

---

## 🔧 RECOMMENDED SECURITY ENHANCEMENTS

### 11. **Security Headers**
Add to production settings:
```python
# Uncomment these in production settings.py
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### 12. **Database Backups**
Set up automated PostgreSQL backups before going live.

### 13. **Monitoring & Alerts**
- Set up error tracking (Sentry, Rollbar)
- Monitor API usage and costs
- Alert on suspicious activity

### 14. **Dependency Scanning**
Regularly check for vulnerabilities:
```bash
# Backend
pip install safety
safety check

# Frontend
npm audit
npm audit fix
```

---

## ✅ SECURITY CHECKLIST FOR PRODUCTION

- [ ] Rotate all API keys and secrets
- [ ] Remove .env files from git history
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS with production domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable all security headers
- [ ] Configure real email backend
- [ ] Set up database backups
- [ ] Review and restrict API key permissions
- [ ] Enable CORS only for production domain
- [ ] Set up error monitoring (Sentry)
- [ ] Run security audit: `python manage.py check --deploy`
- [ ] Update CORS_ALLOWED_ORIGINS for production
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Set up logging and monitoring
- [ ] Create security incident response plan

---

## 📞 INCIDENT RESPONSE

**If credentials are compromised:**

1. **Immediately** rotate the compromised credentials
2. Review access logs for suspicious activity
3. Invalidate all user sessions: `python manage.py clearsessions`
4. Notify affected users if necessary
5. Document the incident

---

## 📚 RESOURCES

- [Django Security Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [12 Factor App](https://12factor.net/)

---

**Last Updated:** 2025-11-30
**Review Frequency:** Before each deployment
