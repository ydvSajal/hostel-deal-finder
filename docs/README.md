# 🛒 BU_Basket - Campus Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> A modern, secure campus marketplace for students to buy, sell, and borrow items within their college community.

## 🌟 Features

### 🔐 **Secure Authentication**
- College email verification (@bennett.edu.in)
- Email confirmation required for account activation
- Secure session management with Supabase Auth

### 💬 **Multi-Buyer Chat System**
- **Real-time messaging** between buyers and sellers
- **Multiple buyers can chat independently** with the same seller
- **Isolated conversation threads** for privacy
- **Unread message notifications** and badges
- **Conversation management** inbox

### 🛍️ **Marketplace Features**
- Create and browse listings with images
- Category-based organization
- Price filtering and search
- Responsive image galleries
- Seller verification system

### 🎨 **Modern UI/UX**
- Beautiful gradient designs with shadcn/ui components
- Dark/light theme support
- Mobile-responsive design
- Smooth animations and transitions
- Accessibility-compliant interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ydvSajal/hostel-deal-finder.git
cd hostel-deal-finder

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application running.

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your Supabase credentials in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up Supabase database (see [SUPABASE_EMAIL_SETUP.md](./SUPABASE_EMAIL_SETUP.md))

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Navigation, footer, etc.
│   ├── sections/       # Page sections
│   └── ui/            # shadcn/ui components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Application pages/routes
└── App.tsx            # Main application component

supabase/
├── migrations/        # Database migrations
└── config.toml       # Supabase configuration
```

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://reactjs.org/)** - Modern React with hooks and concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions for chat
  - Authentication and user management
  - File storage for images
- **[Supabase Auth](https://supabase.com/auth)** - Email verification and session management

### Development & Deployment
- **[ESLint](https://eslint.org/)** - Code linting
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipelines
- **[Vercel](https://vercel.com/)** / **[GitHub Pages](https://pages.github.com/)** - Deployment options

## 📱 Key Pages & Features

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Homepage | Hero section, features overview, authentication status |
| `/listings` | Browse marketplace | View all listings, search, filter, chat buttons |
| `/sell` | Create listing | Upload images, set price, add description |
| `/chat` | Individual chat | Real-time messaging, auto-scroll, timestamps |
| `/conversations` | Chat inbox | Manage all conversations, unread counts |
| `/login` | Authentication | Email verification, secure login/signup |
| `/test-chat` | Testing | Verify multi-buyer chat functionality |

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Database
npx supabase start      # Start local Supabase
npx supabase db reset   # Reset database
npx supabase gen types  # Generate TypeScript types
```

## 🚀 Deployment

### GitHub Pages (Recommended)
Automatic deployment is configured via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at: `https://yourusername.github.io/hostel-deal-finder/`

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ydvSajal/hostel-deal-finder)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🐛 Bug Reports
- Use the [issue tracker](https://github.com/ydvSajal/hostel-deal-finder/issues)
- Include steps to reproduce
- Provide browser/OS information

### ✨ Feature Requests
- Check existing [issues](https://github.com/ydvSajal/hostel-deal-finder/issues) first
- Describe the feature and use case
- Consider implementation approach

### 🔧 Development Workflow

1. **Fork the repository**
```bash
git clone https://github.com/your-username/hostel-deal-finder.git
cd hostel-deal-finder
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
- Follow the existing code style
- Add tests if applicable
- Update documentation

4. **Test your changes**
```bash
npm run type-check
npm run lint
npm run build
```

5. **Commit and push**
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

6. **Create a Pull Request**
- Describe your changes
- Link related issues
- Request review

### 📋 Contribution Guidelines

- **Code Style**: Follow existing TypeScript/React patterns
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- **Testing**: Test your changes thoroughly
- **Documentation**: Update README and comments as needed

### 🎯 Good First Issues

Look for issues labeled `good first issue` or `help wanted`:
- UI improvements
- Bug fixes
- Documentation updates
- New feature implementations

## 📚 Documentation

- **[Chat Functionality](./CHAT_FUNCTIONALITY_SUMMARY.md)** - Multi-buyer chat system details
- **[Supabase Setup](./SUPABASE_EMAIL_SETUP.md)** - Database and email configuration
- **[API Documentation](../src/integrations/supabase/types.ts)** - TypeScript types and schema

## 🔒 Security

- **Email Verification**: Required for all accounts
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **Authentication**: Secure session management

Report security issues privately to the maintainers.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)** for the beautiful component library
- **[Supabase](https://supabase.com/)** for the backend infrastructure
- **[Lucide](https://lucide.dev/)** for the icon set
- **[Tailwind CSS](https://tailwindcss.com/)** for the styling system

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ydvSajal/hostel-deal-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ydvSajal/hostel-deal-finder/discussions)
- **Email**: [Contact the maintainers](mailto:your-email@example.com)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for the student community

</div>