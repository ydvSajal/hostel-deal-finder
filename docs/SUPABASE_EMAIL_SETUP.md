# Supabase Email Setup Guide

This guide walks you through setting up email authentication and verification for BU_Basket using Supabase.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - **Name**: BU_Basket
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Configure the following settings:

#### Site URL
```
http://localhost:8080
```
For production, use your actual domain.

#### Redirect URLs
Add these URLs (one per line):
```
http://localhost:8080
http://localhost:8080/email-confirmed
https://yourdomain.com
https://yourdomain.com/email-confirmed
```

### 3. Email Templates

Go to **Authentication > Email Templates** and customize:

#### Confirm Signup Template
```html
<h2>Welcome to BU_Basket!</h2>
<p>Thanks for signing up with your college email. Please confirm your account by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

#### Reset Password Template
```html
<h2>Reset your BU_Basket password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

### 4. Email Provider Setup

#### Option A: Use Supabase SMTP (Development)
For development, Supabase provides a built-in SMTP service with rate limits.

#### Option B: Custom SMTP (Production)
For production, configure your own SMTP provider:

1. Go to **Authentication > Settings > SMTP Settings**
2. Enable "Enable custom SMTP"
3. Configure your SMTP provider:

**Gmail Example:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
Sender Name: BU_Basket
Sender Email: noreply@yourdomain.com
```

**SendGrid Example:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
Sender Name: BU_Basket
Sender Email: noreply@yourdomain.com
```

### 5. Environment Variables

Create `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from **Settings > API** in your Supabase dashboard.

### 6. Database Setup

Run the database migrations to set up the required tables:

```bash
# If you have Supabase CLI installed
npx supabase db reset

# Or manually run the SQL migrations in your Supabase SQL editor
```

## 🔧 Advanced Configuration

### College Email Domain Restriction

The app is configured to only allow emails from `@bennett.edu.in`. To change this:

1. Edit `src/lib/config.ts`:
```typescript
export const config = {
  collegeEmailDomain: 'your-college.edu',
  // ... other config
};
```

2. Update the email validation in `src/pages/Login.tsx` if needed.

### Email Verification Flow

The app implements a secure email verification flow:

1. User signs up with college email
2. Supabase sends confirmation email
3. User clicks link in email
4. User is redirected to `/email-confirmed`
5. User can now log in and use the app

### Row Level Security (RLS)

The database uses RLS to ensure data security:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only access conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
```

## 🧪 Testing Email Setup

### Local Testing

1. Start your development server:
```bash
npm run dev
```

2. Go to `http://localhost:8080/login`
3. Try signing up with a college email
4. Check your email for the confirmation link
5. Click the link to verify your account

### Production Testing

1. Deploy your app to your hosting provider
2. Update the Site URL and Redirect URLs in Supabase
3. Test the full signup and login flow
4. Verify emails are being sent and received

## 🔍 Troubleshooting

### Common Issues

#### Emails Not Sending
- Check SMTP configuration
- Verify sender email is authorized
- Check Supabase logs in dashboard
- Ensure rate limits aren't exceeded

#### Confirmation Links Not Working
- Verify redirect URLs are correct
- Check Site URL configuration
- Ensure HTTPS in production
- Check browser console for errors

#### College Email Validation Failing
- Verify domain configuration in `config.ts`
- Check email regex patterns
- Test with different email formats

### Debug Steps

1. **Check Supabase Logs**:
   - Go to **Logs** in your Supabase dashboard
   - Look for authentication and email-related errors

2. **Browser Console**:
   - Open developer tools
   - Check for JavaScript errors
   - Monitor network requests

3. **Email Provider Logs**:
   - Check your SMTP provider's logs
   - Verify API keys and credentials

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Support

If you encounter issues:

1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review the [troubleshooting guide](https://supabase.com/docs/guides/auth/troubleshooting)
3. Create an issue in this repository
4. Contact the maintainers

---

Happy coding! 🚀