# Supabase Email Configuration for BU_Basket

## Overview
This guide explains how to configure Supabase email templates for college email verification with custom branding and proper redirect handling.

## 1. Supabase Dashboard Configuration

### Email Templates Setup
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Configure the **Confirm signup** template

### Custom Email Template HTML

Replace the default template with this custom HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your College Email - BU_Basket</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .verification-box {
            background: #f1f5f9;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .college-badge {
            background: #dcfce7;
            color: #166534;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 30px;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            font-size: 14px;
            color: #92400e;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎓 BU_Basket</div>
            <div class="subtitle">Campus Marketplace for Bennett University</div>
        </div>
        
        <div class="content">
            <h2>Verify Your College Email</h2>
            <p>Welcome to BU_Basket! We need to verify that you're a Bennett University student.</p>
            
            <div class="college-badge">
                ✅ College Email: {{ .Email }}
            </div>
            
            <div class="verification-box">
                <h3>🔐 Complete Your Verification</h3>
                <p>Click the button below to verify your college email and activate your BU_Basket account:</p>
                
                <a href="{{ .ConfirmationURL }}" class="verify-button">
                    Verify My College Email
                </a>
                
                <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
                    This link will redirect you to BU_Basket where you can start buying, selling, and borrowing items with fellow students.
                </p>
            </div>
            
            <div class="security-note">
                <strong>🛡️ Security Note:</strong> This verification ensures only Bennett University students can access our marketplace. Keep your account secure!
            </div>
            
            <h3>What's Next?</h3>
            <ul>
                <li>✅ Verify your email (click the button above)</li>
                <li>🛍️ Browse items from fellow students</li>
                <li>💰 List your own items for sale</li>
                <li>💬 Chat securely with other students</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent to verify your Bennett University student status.</p>
            <p>If you didn't create a BU_Basket account, you can safely ignore this email.</p>
            <p style="margin-top: 15px;">
                <strong>BU_Basket</strong> - The trusted marketplace for Bennett University students<br>
                <a href="{{ .SiteURL }}" style="color: #2563eb;">Visit BU_Basket</a>
            </p>
        </div>
    </div>
</body>
</html>
```

## 2. Email Settings Configuration

### SMTP Settings (Recommended for Production)
1. Go to **Authentication** → **Settings**
2. Configure custom SMTP:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: 587 (TLS) or 465 (SSL)
   - **SMTP User**: Your email address
   - **SMTP Pass**: Your email password or app password
   - **Sender Email**: noreply@yourdomain.com
   - **Sender Name**: BU_Basket

### Email Rate Limiting
- Set appropriate rate limits to prevent spam
- Recommended: 10 emails per hour per IP

## 3. URL Configuration

### Site URL
Set your site URL in **Authentication** → **Settings**:
- Development: `http://localhost:8080`
- Production: `https://yourdomain.com` or `https://yourusername.github.io/hostel-deal-finder`

### Redirect URLs
Add these URLs to **Authentication** → **URL Configuration**:
- `http://localhost:8080/email-confirmed`
- `https://yourdomain.com/email-confirmed`
- `https://yourusername.github.io/hostel-deal-finder/email-confirmed`

## 4. Security Settings

### Email Confirmation
- ✅ Enable "Confirm email" in **Authentication** → **Settings**
- ✅ Set "Confirm email change" to true
- ✅ Enable "Secure email change" for additional security

### Domain Restrictions (Optional)
You can add email domain restrictions in **Authentication** → **Settings**:
```json
{
  "allowed_email_domains": ["bennett.edu.in"]
}
```

## 5. Testing the Email Flow

### Test Checklist
1. ✅ Create account with @bennett.edu.in email
2. ✅ Check email delivery (including spam folder)
3. ✅ Click verification button in email
4. ✅ Verify redirect to `/email-confirmed` page
5. ✅ Confirm user can log in after verification
6. ✅ Test resend confirmation email functionality

### Common Issues & Solutions

**Email not received:**
- Check spam/junk folder
- Verify SMTP configuration
- Check Supabase logs for delivery errors

**Redirect not working:**
- Verify redirect URLs are added to Supabase
- Check that base URL is correctly configured
- Ensure HTTPS is used in production

**Verification fails:**
- Check that email confirmation is enabled
- Verify the confirmation URL format
- Check browser console for errors

## 6. Production Deployment Notes

### Environment Variables
Make sure these are set in production:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### GitHub Pages Specific
If deploying to GitHub Pages, ensure:
- Base URL is set correctly in `vite.config.ts`
- Redirect URLs include the repository path
- HTTPS is enforced

## 7. Email Template Variables

Available variables in Supabase email templates:
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .SiteURL }}` - Your site's base URL
- `{{ .TokenHash }}` - Confirmation token (for custom implementations)

## 8. Monitoring & Analytics

### Supabase Dashboard
Monitor email delivery in:
- **Authentication** → **Users** (see confirmation status)
- **Logs** → **Auth Logs** (check for errors)

### User Experience Metrics
Track these metrics:
- Email delivery rate
- Confirmation click rate
- Time from signup to confirmation
- Failed confirmation attempts

This setup ensures a professional, secure, and user-friendly email verification process for your college marketplace.