# Security Policy

## Supported Versions

We actively support the following versions of BU_Basket:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues privately by:

1. **Email**: Send details to [security@bubasket.com] (replace with actual email)
2. **GitHub Security**: Use GitHub's private vulnerability reporting feature
3. **Direct Contact**: Contact the maintainers directly

### 📋 What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Browser, OS, and version information
- **Proof of Concept**: Code or screenshots (if applicable)
- **Suggested Fix**: If you have ideas for fixing it

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### 🏆 Recognition

We appreciate security researchers who help keep BU_Basket safe:

- **Hall of Fame**: Public recognition (with permission)
- **Credits**: Mentioned in release notes
- **Swag**: BU_Basket merchandise (when available)

## Security Measures

### 🔐 Authentication & Authorization

- **Email Verification**: Required for all accounts
- **College Email Only**: Restricted to verified educational domains
- **Session Management**: Secure session handling with Supabase Auth
- **Row Level Security**: Database-level access control

### 🛡️ Data Protection

- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Built-in CSRF protection

### 🔒 Infrastructure Security

- **HTTPS Only**: All communications encrypted
- **Secure Headers**: Security headers implemented
- **Environment Variables**: Sensitive data in environment variables
- **Regular Updates**: Dependencies updated regularly

### 💬 Chat Security

- **Message Encryption**: Messages encrypted in transit
- **Access Control**: Only conversation participants can access messages
- **Content Moderation**: Inappropriate content detection (planned)
- **Privacy**: Isolated conversation threads

## Security Best Practices

### For Users

- **Strong Passwords**: Use unique, strong passwords
- **Account Security**: Don't share login credentials
- **Suspicious Activity**: Report unusual behavior
- **Privacy Settings**: Review and adjust privacy settings

### For Developers

- **Code Review**: All code changes reviewed
- **Dependency Scanning**: Regular security scans
- **Static Analysis**: Automated security testing
- **Secure Coding**: Follow OWASP guidelines

## Vulnerability Disclosure Policy

### Our Commitment

- We will respond to security reports promptly
- We will keep you informed throughout the process
- We will credit you for responsible disclosure (with permission)
- We will not pursue legal action for good-faith security research

### Scope

**In Scope:**
- BU_Basket web application
- API endpoints
- Database security
- Authentication systems
- Chat functionality

**Out of Scope:**
- Third-party services (Supabase, Vercel, etc.)
- Social engineering attacks
- Physical security
- Denial of service attacks

### Safe Harbor

We consider the following activities as authorized security research:

- Testing for security vulnerabilities
- Accessing only your own data
- Not disrupting our services
- Not accessing other users' data
- Reporting findings responsibly

## Security Updates

Security updates will be:

- **Prioritized**: Fixed as quickly as possible
- **Documented**: Included in release notes
- **Communicated**: Announced to users when appropriate
- **Tested**: Thoroughly tested before deployment

## Contact

For security-related questions or concerns:

- **Security Email**: [security@bubasket.com] (replace with actual)
- **General Issues**: [GitHub Issues](https://github.com/ydvSajal/hostel-deal-finder/issues)
- **Maintainers**: Contact project maintainers directly

---

Thank you for helping keep BU_Basket and our users safe! 🛡️