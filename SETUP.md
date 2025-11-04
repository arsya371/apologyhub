# Setup Guide - I'm Sorry Platform

This guide provides detailed instructions for setting up the I'm Sorry anonymous apology platform on your local machine or server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Cloudflare Turnstile Setup](#cloudflare-turnstile-setup)
- [Admin Account Setup](#admin-account-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v18.x or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **yarn**
   - Verify installation: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **PostgreSQL Database**
   - Option A: Cloud database (recommended for beginners)
     - [NeonDB](https://neon.tech/) - Free tier available
     - [Supabase](https://supabase.com/) - Free tier available
     - [Railway](https://railway.app/) - Free tier available
   - Option B: Local PostgreSQL installation
     - Download from [postgresql.org](https://www.postgresql.org/download/)

### Required Accounts

1. **Cloudflare Account** (Free)
   - Sign up at [cloudflare.com](https://www.cloudflare.com/)
   - Needed for Turnstile bot protection

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd im-sorry
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install all required packages including:
- Next.js framework
- Prisma ORM
- NextAuth.js
- shadcn/ui components
- And all other dependencies

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

## Environment Configuration

Open the `.env` file in your text editor and configure the following variables:

### Database Configuration

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

**Examples:**

- **NeonDB:**
  ```env
  DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
  ```

- **Supabase:**
  ```env
  DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
  ```

- **Local PostgreSQL:**
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/im_sorry"
  ```

### Authentication Configuration

```env
# Generate a random secret key (32+ characters)
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"

# Application URL
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secure secret:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -base64 32
```

### Cloudflare Turnstile Configuration

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"
```

See [Cloudflare Turnstile Setup](#cloudflare-turnstile-setup) section below.

### Admin Credentials

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

**Important:** Change these to your desired admin credentials. The password should be strong and unique.

### Optional Cloudflare Configuration

```env
# For advanced IP blocking features (optional)
CLOUDFLARE_API_TOKEN=""
CLOUDFLARE_ZONE_ID=""
```

### Rate Limiting

```env
# Number of requests allowed per IP per time window
REQUEST_LIMIT="20"
```

### Application Settings

```env
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

### Step 1: Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma Client based on your schema.

### Step 2: Push Schema to Database

```bash
npm run db:push
```

This creates all necessary tables in your database:
- `apologies` - Stores apology submissions
- `settings` - Site configuration
- `admins` - Admin accounts
- `analytics` - Usage statistics
- `activity_logs` - Admin action logs
- `blocked_ips` - IP blocking records
- `allowed_ips` - IP allowlist
- `security_logs` - Security events
- `profanity_words` - Content moderation

### Step 3: Seed Initial Data

```bash
npm run db:seed
```

This will:
- Create the admin account (using credentials from `.env`)
- Initialize site settings
- Add default profanity words
- Create initial analytics records

**Expected Output:**
```
✓ Admin user created
✓ Settings initialized
✓ Profanity words added
✓ Database seeded successfully
```

## Cloudflare Turnstile Setup

Turnstile provides bot protection for form submissions.

### Step 1: Access Turnstile Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **Add Site**

### Step 2: Configure Site

- **Site Name:** I'm Sorry Platform (or your preferred name)
- **Domain:** 
  - For development: `localhost`
  - For production: `yourdomain.com`
- **Widget Mode:** Managed (recommended)

### Step 3: Get Keys

After creating the site, you'll receive:
- **Site Key** (public) - Add to `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- **Secret Key** (private) - Add to `TURNSTILE_SECRET_KEY`

### Step 4: Update Environment Variables

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAxxxxxxxxxxxxx"
TURNSTILE_SECRET_KEY="0x4AAAAAAxxxxxxxxxxxxx"
```

**Note:** For development, you can use Turnstile's test keys:
- Site Key: `1x00000000000000000000AA`
- Secret Key: `1x0000000000000000000000000000000AA`

## Admin Account Setup

The admin account is created during database seeding using the credentials from your `.env` file.

### Default Access

- **URL:** `http://localhost:3000/pradmin`
- **Email:** Value from `ADMIN_EMAIL` in `.env`
- **Password:** Value from `ADMIN_PASSWORD` in `.env`

### Creating Additional Admins

After initial setup, you can create additional admin accounts through:

1. **Database directly** (using Prisma Studio):
   ```bash
   npm run db:studio
   ```

2. **Future feature:** Admin management UI (if implemented)

### Password Requirements

- Minimum 8 characters
- Mix of uppercase and lowercase
- Include numbers and special characters
- Avoid common passwords

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3000`

**Features in Development Mode:**
- Hot reload on file changes
- Detailed error messages
- Source maps enabled
- Development-specific logging

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start
```

**Production optimizations:**
- Minified code
- Optimized assets
- Server-side rendering
- Better performance

### Using Prisma Studio

View and edit database records visually:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

## Verification

### 1. Check Application is Running

Open your browser and navigate to:
- **Homepage:** `http://localhost:3000`
- **Browse Page:** `http://localhost:3000/browse`
- **Submit Page:** `http://localhost:3000/submit`
- **Admin Login:** `http://localhost:3000/pradmin/login`

### 2. Test Public Features

1. **Submit an Apology:**
   - Go to `/submit`
   - Fill out the form
   - Complete Turnstile challenge
   - Submit

2. **Browse Apologies:**
   - Go to `/browse`
   - Verify submitted apology appears
   - Test search functionality

### 3. Test Admin Features

1. **Login:**
   - Go to `/pradmin/login`
   - Use credentials from `.env`
   - Should redirect to dashboard

2. **Dashboard:**
   - Verify analytics display
   - Check charts render correctly

3. **Apology Management:**
   - Navigate to Apologies section
   - View submitted apologies
   - Test edit/delete functions

4. **Settings:**
   - Navigate to Settings
   - Update site name
   - Save changes

### 4. Verify Database

```bash
npm run db:studio
```

Check that tables contain expected data:
- `admins` - Your admin account
- `settings` - Site configuration
- `apologies` - Test submissions
- `profanity_words` - Default word list

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check database is running (if local)
3. Verify network connectivity
4. Check firewall settings
5. For cloud databases, verify IP allowlist

**Test connection:**
```bash
npm run db:studio
```

### Prisma Client Issues

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Build Errors

**Error:** `Module not found` or `Cannot find module`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Turnstile Not Working

**Error:** Turnstile widget not appearing

**Solutions:**
1. Verify site key is correct
2. Check domain matches Turnstile configuration
3. Ensure `NEXT_PUBLIC_` prefix is present
4. Clear browser cache
5. Check browser console for errors

**Test with dummy keys:**
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

### Admin Login Fails

**Error:** Invalid credentials

**Solutions:**
1. Verify `.env` credentials are correct
2. Re-run database seed:
   ```bash
   npm run db:seed
   ```
3. Check admin record in database:
   ```bash
   npm run db:studio
   ```
4. Ensure password meets requirements

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. Kill process using port 3000:
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. Or use different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Environment Variables Not Loading

**Error:** Variables are undefined

**Solutions:**
1. Ensure `.env` file is in root directory
2. Restart development server
3. Check for syntax errors in `.env`
4. Verify variable names match exactly
5. For public variables, ensure `NEXT_PUBLIC_` prefix

### TypeScript Errors

**Error:** Type errors during development

**Solutions:**
```bash
# Regenerate Prisma types
npm run db:generate

# Check TypeScript configuration
npx tsc --noEmit
```

### Styling Issues

**Error:** Styles not applying

**Solutions:**
1. Verify Tailwind is configured
2. Check `globals.css` is imported
3. Clear `.next` cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

## Next Steps

After successful setup:

1. **Customize Settings:**
   - Update site name and description
   - Configure SEO settings
   - Set up announcements

2. **Configure Security:**
   - Review rate limiting settings
   - Set up IP allowlist if needed
   - Configure profanity filters

3. **Test Thoroughly:**
   - Submit test apologies
   - Test moderation features
   - Verify analytics tracking

4. **Prepare for Production:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Set up proper domain
   - Configure production database
   - Update Turnstile for production domain

## Additional Resources

- **Prisma Documentation:** [prisma.io/docs](https://www.prisma.io/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **NextAuth.js Documentation:** [next-auth.js.org](https://next-auth.js.org)
- **Cloudflare Turnstile:** [developers.cloudflare.com/turnstile](https://developers.cloudflare.com/turnstile)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)

## Getting Help

If you encounter issues not covered in this guide:

1. Check existing GitHub issues
2. Review error logs in console
3. Use Prisma Studio to inspect database
4. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong passwords** - Especially for admin accounts
3. **Rotate secrets regularly** - Update `NEXTAUTH_SECRET` periodically
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS in production** - Never use HTTP for production
6. **Backup database regularly** - Implement automated backups
7. **Monitor security logs** - Check admin panel regularly

---

**Setup complete!** You're now ready to use the I'm Sorry platform. For deployment instructions.
