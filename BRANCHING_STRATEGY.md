# 🌿 Git Branching Strategy

## Branch Naming Convention

We follow a clear branching strategy for organized development:

### Branch Types:

1. **`main`** (or `master`)
   - Production-ready code
   - Always stable and deployable
   - Protected branch (no direct commits)

2. **`feature/<feature-name>`**
   - New features or enhancements
   - Examples:
     - `feature/smart-document-assistant`
     - `feature/quiz-generator`
     - `feature/audio-learning`
     - `feature/flashcard-generator`

3. **`bugfix/<bug-description>`**
   - Bug fixes
   - Examples:
     - `bugfix/login-error`
     - `bugfix/cors-issue`

4. **`hotfix/<issue-description>`**
   - Critical production fixes
   - Examples:
     - `hotfix/security-patch`
     - `hotfix/api-timeout`

5. **`refactor/<component-name>`**
   - Code refactoring
   - Examples:
     - `refactor/middleware-architecture`
     - `refactor/api-structure`

6. **`docs/<documentation-update>`**
   - Documentation updates
   - Examples:
     - `docs/api-documentation`
     - `docs/setup-guide`

---

## Workflow

### Creating a Feature Branch:

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create and switch to new feature branch
git checkout -b feature/smart-document-assistant

# 3. Work on your feature, commit changes
git add .
git commit -m "Add document upload UI"

# 4. Push branch to remote
git push -u origin feature/smart-document-assistant
```

### Merging Back to Main:

```bash
# 1. Make sure all changes are committed
git status

# 2. Switch to main
git checkout main

# 3. Pull latest changes
git pull origin main

# 4. Merge feature branch
git merge feature/smart-document-assistant

# 5. Push to remote
git push origin main

# 6. Delete local branch (optional)
git branch -d feature/smart-document-assistant

# 7. Delete remote branch (optional)
git push origin --delete feature/smart-document-assistant
```

---

## Current Active Branch

**Current Branch**: `feature/smart-document-assistant`

**Purpose**: Implementing Smart Document Assistant feature
- Document upload & processing
- AI summarization
- Text-to-speech integration
- Interactive Q&A

---

## Best Practices

1. ✅ **Always create a branch for new features**
2. ✅ **Keep branches focused** - one feature per branch
3. ✅ **Commit frequently** with clear messages
4. ✅ **Keep main branch stable** - only merge tested code
5. ✅ **Delete merged branches** to keep repo clean
6. ✅ **Use descriptive branch names** - be specific

---

## Branch Protection (Recommended)

For production, consider protecting the `main` branch:
- Require pull requests for merges
- Require code reviews
- Require status checks to pass
- Prevent force pushes

---

## Quick Reference

```bash
# List all branches
git branch -a

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout branch-name

# See current branch
git branch

# Push new branch to remote
git push -u origin feature/your-feature-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

