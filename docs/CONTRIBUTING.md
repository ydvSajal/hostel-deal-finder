# Contributing to BU_Basket

Thank you for your interest in contributing to BU_Basket! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Search existing issues before creating new ones
- Use the bug report template
- Include reproduction steps, expected vs actual behavior
- Provide browser/OS information and screenshots if applicable

### ✨ Feature Requests
- Check if the feature already exists or is planned
- Use the feature request template
- Describe the problem you're solving
- Provide mockups or examples if helpful

### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation updates
- Test coverage improvements

### 📚 Documentation
- README improvements
- Code comments
- API documentation
- Tutorial creation
- Translation (future)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and Supabase

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/hostel-deal-finder.git
cd hostel-deal-finder
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
# Configure your Supabase credentials
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Verify Setup**
- Visit `http://localhost:8080`
- Run tests: `npm run type-check && npm run lint`

## 📝 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing, avoid `any`
- **React**: Functional components with hooks
- **Naming**: Use descriptive names, follow existing patterns
- **Comments**: Document complex logic and public APIs

### File Organization
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   └── sections/     # Page-specific sections
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── integrations/     # Third-party integrations
```

### Component Guidelines
```typescript
// Good: Typed props interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button = ({ variant, onClick, children }: ButtonProps) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Database Changes
- Create migrations for schema changes
- Update TypeScript types after schema changes
- Test migrations thoroughly
- Document breaking changes

## 🔄 Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve chat message ordering issue
docs: update API documentation
style: improve button hover effects
refactor: simplify authentication logic
test: add chat functionality tests
```

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature
```

2. **Make Changes**
- Write clean, tested code
- Follow existing patterns
- Update documentation

3. **Test Changes**
```bash
npm run type-check
npm run lint
npm run build
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat: add your feature"
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature
```

6. **PR Requirements**
- Clear title and description
- Link related issues
- Include screenshots for UI changes
- Request appropriate reviewers

## 🧪 Testing

### Manual Testing
- Test your changes across different browsers
- Verify mobile responsiveness
- Test authentication flows
- Verify chat functionality

### Automated Testing
```bash
npm run type-check    # TypeScript validation
npm run lint         # Code style checking
npm run build        # Production build test
```

### Chat System Testing
Use the `/test-chat` page to verify:
- Multiple buyer conversations work
- Real-time messaging functions
- Message persistence
- Unread count accuracy

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to docs
- `question` - Further information requested
- `wontfix` - This will not be worked on

## 🎯 Priority Areas

### High Priority
- Security improvements
- Performance optimizations
- Mobile responsiveness
- Accessibility compliance

### Medium Priority
- New marketplace features
- UI/UX improvements
- Additional authentication methods
- Search and filtering enhancements

### Low Priority
- Code refactoring
- Documentation improvements
- Developer experience enhancements

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues privately to maintainers
- Include detailed reproduction steps
- Allow time for fixes before public disclosure

### Security Best Practices
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication checks
- Follow OWASP guidelines
- Keep dependencies updated

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Supabase Dashboard](https://app.supabase.com/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

## 🤔 Questions?

- Check existing [issues](https://github.com/ydvSajal/hostel-deal-finder/issues)
- Start a [discussion](https://github.com/ydvSajal/hostel-deal-finder/discussions)
- Contact maintainers

## 🙏 Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- Contributor list (coming soon)

Thank you for contributing to BU_Basket! 🎉