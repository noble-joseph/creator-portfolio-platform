# Contributing to Creator Portfolio Platform

Thank you for your interest in contributing to the Creator Portfolio Platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/creator-portfolio-platform.git`
3. Create a new branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+ and npm 8+
- MongoDB (local or cloud)
- Redis (optional, for sessions)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creator-portfolio-platform.git
   cd creator-portfolio-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/env.example client/.env
   
   # Edit the .env files with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## Contributing Guidelines

### Types of Contributions

- **Bug fixes**: Fix issues in the codebase
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **UI/UX**: Improve user interface and experience

### Before You Start

1. Check existing issues and pull requests to avoid duplicates
2. For large changes, open an issue first to discuss the approach
3. Ensure your changes align with the project's goals

## Pull Request Process

### Before Submitting

1. **Run tests**
   ```bash
   npm test
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Format code**
   ```bash
   npm run format
   ```

4. **Update documentation** if needed

### Pull Request Template

When creating a pull request, please include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Screenshots**: For UI changes
- **Breaking Changes**: If any
- **Related Issues**: Link to related issues

### Review Process

1. All pull requests require review
2. Address feedback promptly
3. Keep pull requests focused and atomic
4. Update your branch if conflicts arise

## Issue Guidelines

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node.js version, etc.
- **Screenshots**: If applicable

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add PropTypes or TypeScript types

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── utils/         # Utility functions
├── hooks/         # Custom hooks
├── services/      # API services
└── assets/        # Static assets
```

## Testing

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for high test coverage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```javascript
describe('Component/Function Name', () => {
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include examples in documentation
- Keep README files updated

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error responses
- Keep API docs in sync with code

## Commit Messages

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add Google OAuth login
fix(api): resolve user registration validation error
docs(readme): update installation instructions
```

## Performance Guidelines

- Optimize images and assets
- Use lazy loading for components
- Implement proper caching
- Monitor bundle size
- Use React.memo for expensive components

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines

## Getting Help

- Check existing documentation
- Search existing issues
- Join our community discussions
- Contact maintainers if needed

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to the Creator Portfolio Platform! 🎉
