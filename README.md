# ApologyHub - Anonymous Apology Platform

ApologyHub platform built with Next.js 14, Prisma, and shadcn/ui. Users can submit, browse, and share anonymous apologies with built-in security features and comprehensive admin controls.

## Features

### Public Features
- **Anonymous Submissions** - Submit apologies without requiring an account
- **Browse & Search** - Explore apologies with filtering and search capabilities
- **Share Apologies** - Direct links to individual apology pages
- **Bot Protection** - Cloudflare Turnstile integration
- **Responsive Design** - Modern Neobrutalism UI with dark/light theme support

### Admin Features
- **Dashboard Analytics** - Real-time statistics and charts
- **Apology Management** - Review, approve, edit, and delete submissions
- **Security Controls** - IP blocking/allowlisting, rate limiting, security logs
- **Content Moderation** - Profanity filtering with custom word lists
- **Site Settings** - Configure announcements, SEO, and site parameters
- **Activity Logging** - Track all admin actions and system events

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions)
- **Language**: TypeScript
- **UI Library**: React 18 with shadcn/ui components
- **Styling**: Tailwind CSS (Neobrutalism theme)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Security**: Cloudflare Turnstile, Rate Limiting, IP Management
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Form Validation**: Zod
- **Date Handling**: date-fns

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (NeonDB, Supabase, or local instance)
- **Cloudflare Account** (for Turnstile bot protection)
- **Git** (for cloning the repository)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd im-sorry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [SETUP.md](./SETUP.md) for details)

4. **Setup database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Project Structure

```
im-sorry/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (home, browse, submit, apology)
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin API endpoints
│   │   ├── apologies/      # Apology CRUD operations
│   │   └── auth/           # NextAuth configuration
│   └── pradmin/            # Admin panel
│       ├── (protected)/    # Protected admin pages
│       └── login/          # Admin login
├── features/               # Feature-based modules
│   ├── admin/             # Admin components and types
│   ├── apologies/         # Apology components and types
│   └── auth/              # Authentication components
├── server/                # Backend logic
│   ├── auth/             # Auth configuration
│   ├── db/               # Database client and seeding
│   ├── mutations/        # Data mutations (create, update, delete)
│   ├── queries/          # Data queries (read operations)
│   └── services/         # Business logic services
├── ui/                   # Shared UI components
│   └── components/
│       ├── layout/       # Layout components (Header, Footer, etc.)
│       ├── seo/          # SEO components
│       ├── shared/       # Reusable components
│       └── ui/           # shadcn/ui components
├── lib/                  # Utilities and helpers
│   ├── constants.ts      # App constants
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── prisma/              # Database schema
│   └── schema.prisma
├── styles/              # Global styles
│   └── globals.css
└── types/               # TypeScript type definitions
```

## Admin Access

- **Admin Panel URL**: `/pradmin`
- **Default Credentials**: Set via environment variables during seeding
- **Features**: Dashboard, Apology Management, Security, Settings

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with initial data |

## Security Features

- **Cloudflare Turnstile** - Bot protection on forms
- **Rate Limiting** - Configurable request limits per IP
- **IP Blocking** - Manual and automatic IP blocking
- **IP Allowlisting** - Whitelist trusted IPs
- **Content Moderation** - Profanity filtering with severity levels
- **Security Logging** - Comprehensive audit trail
- **Activity Tracking** - Monitor all admin actions
- **Password Hashing** - bcrypt for admin credentials

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret
- `ADMIN_EMAIL` - Initial admin email
- `ADMIN_PASSWORD` - Initial admin password

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity

**Turnstile not working**
- Verify site key and secret key
- Check domain configuration in Cloudflare dashboard
- Ensure keys match environment (development/production)

**Admin login fails**
- Run `npm run db:seed` to create admin account
- Verify credentials in `.env` file
- Check database for admin record

For more help, see [SETUP.md](./SETUP.md) or open an issue.

## Support

For questions or issues, please open a GitHub issue.
