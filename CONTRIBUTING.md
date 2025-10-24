# Contributing to MealTrack

Thank you for your interest in contributing to MealTrack! This guide will help you get started.

## Code of Conduct

Be respectful, constructive, and helpful. This app is built for student athletes - keep their needs first.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Mustangs.git
   cd Mustangs
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the App

```bash
npm start
```

### Code Style

We use TypeScript and follow these conventions:

- **Components**: PascalCase (`MealCard.tsx`)
- **Files**: camelCase (`foodRecognition.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MEAL_NUMBERS`)
- **Interfaces**: PascalCase, descriptive (`MealCardProps`)

### File Organization

```
src/
├── screens/      → Full-page views
├── components/   → Reusable UI elements
├── services/     → Business logic, API calls
├── types/        → TypeScript interfaces
└── constants/    → App-wide constants
```

### Component Structure

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
```

## Making Changes

### Before You Start

1. **Check existing issues** - Avoid duplicate work
2. **Create an issue** - Discuss major changes first
3. **Keep it simple** - Remember the target user

### Design Principles

All changes should align with these principles:

1. **Speed over features** - Don't add complexity
2. **Visual over text** - Use icons and colors
3. **Self-explanatory** - No tutorials needed
4. **Forgiving** - Allow easy corrections

### Testing Changes

1. **Test on real device** - Emulators miss camera issues
2. **Test both platforms** - iOS and Android
3. **Test offline** - App must work without internet
4. **Test with/without API** - Both modes should work

### Common Changes

#### Adding a New Screen

1. Create file in `src/screens/`
2. Add to navigation in `App.tsx`
3. Update types if needed
4. Test navigation flow

#### Adding a Component

1. Create file in `src/components/`
2. Define clear prop interface
3. Use COLORS from constants
4. Make it reusable

#### Modifying API Logic

1. Update `src/services/foodRecognition.ts`
2. Ensure fallback still works
3. Handle errors gracefully
4. Update API_INTEGRATION.md

## Pull Request Process

### Before Submitting

- [ ] Code follows style guide
- [ ] App runs without errors
- [ ] Tested on real device
- [ ] No console warnings
- [ ] Updated documentation if needed
- [ ] Commits are clear and descriptive

### PR Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Testing
How did you test this?

## Screenshots
If UI changes, include before/after

## Checklist
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Updated docs
- [ ] No breaking changes
```

### Review Process

1. Submit PR
2. Maintainer reviews (1-2 days)
3. Address feedback
4. Approved → Merged

## Areas for Contribution

### High Priority

- [ ] Better food recognition accuracy
- [ ] Barcode scanning for packaged foods
- [ ] Meal templates for common foods
- [ ] Water intake tracking
- [ ] Dark mode support

### Medium Priority

- [ ] Custom macro goals
- [ ] Weekly trend charts
- [ ] Meal reminders/notifications
- [ ] Multi-language support

### Low Priority

- [ ] Social features
- [ ] Recipe suggestions
- [ ] Integration with fitness trackers
- [ ] Web dashboard

### Always Welcome

- Bug fixes
- Performance improvements
- Documentation updates
- Test coverage
- Accessibility improvements

## Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Device: iPhone 13 Pro
- OS: iOS 16.5
- App Version: 1.0.0
- Expo Version: 50.0.0

**Additional Context**
Any other relevant information
```

## Feature Requests

### Template

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How would you implement this?

**Alternatives**
Other approaches considered

**User Impact**
How does this help athletes?

**Complexity**
Simple / Medium / Complex
```

### Evaluation Criteria

Feature requests are evaluated on:

1. **Alignment** - Fits design principles?
2. **Impact** - Helps target users?
3. **Complexity** - Worth the effort?
4. **Maintenance** - Sustainable long-term?

## Documentation

### When to Update Docs

- New features → Update README.md
- API changes → Update API_INTEGRATION.md
- Design changes → Update DESIGN.md
- Setup changes → Update SETUP.md

### Documentation Style

- Clear, concise language
- Code examples where helpful
- Screenshots for UI changes
- Target audience: developers new to project

## Code Review Guidelines

### What We Look For

**Good**:
- Simple, readable code
- Consistent with existing patterns
- Well-named variables/functions
- Handles errors gracefully
- Comments for complex logic

**Bad**:
- Over-engineered solutions
- Inconsistent styling
- Missing error handling
- Unclear variable names
- Uncommented complex code

### Review Checklist

- [ ] Code is clear and maintainable
- [ ] Follows existing patterns
- [ ] Error handling present
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] TypeScript types correct

## Release Process

Releases follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes

### Changelog

All changes documented in commit messages using conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Maintenance

## Questions?

- **General questions**: Open a discussion
- **Bug reports**: Create an issue
- **Feature ideas**: Create a feature request
- **Security issues**: Email directly (don't create public issue)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make MealTrack better for student athletes!** 🏋️‍♂️📸
