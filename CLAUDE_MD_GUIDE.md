# Claude.md Files Guide

## Overview

`claude.md` files have been added to provide comprehensive project context for AI assistants (like Claude). These files help AI understand the project structure, conventions, and best practices.

## Files Created

### 1. Root claude.md
**Location**: `/claude.md`

**Purpose**: Provides full-stack context including:
- Project overview and architecture
- Technology stack details
- File structure and key files
- Coding standards and conventions
- Common tasks and workflows
- Debugging guides
- API specifications

**When to reference**:
- Starting new features
- Understanding project architecture
- Learning coding conventions
- Debugging issues

### 2. Backend claude.md
**Location**: `/server/claude.md`

**Purpose**: Backend-specific documentation including:
- Express server architecture
- LangChain.js integration details
- API endpoint specifications
- Environment configuration
- Service layer structure
- Error handling patterns
- Testing strategies

**When to reference**:
- Working on backend code
- Modifying API endpoints
- Debugging backend issues
- Understanding AI integration

## What's Included

### Architecture Documentation
- System design diagrams
- Component relationships
- Data flow explanations
- Technology stack details

### Code Organization
- Directory structure
- File naming conventions
- Import patterns
- Module organization

### Coding Standards
- TypeScript conventions
- React patterns
- Express best practices
- Error handling approaches

### Development Workflows
- Setup instructions
- Common commands
- Testing procedures
- Debugging techniques

### AI Integration Details
- LangChain.js usage
- Claude API integration
- Prompt engineering patterns
- Streaming implementation

## How AI Assistants Use These Files

### Context Understanding
AI assistants can reference these files to:
- Understand project conventions
- Follow established patterns
- Make context-aware suggestions
- Avoid common pitfalls

### Code Generation
When generating code, AI can:
- Match existing code style
- Use correct import patterns
- Follow project structure
- Implement proper error handling

### Problem Solving
For debugging and fixes:
- Understand system architecture
- Identify affected components
- Follow best practices
- Consider edge cases

## Maintaining claude.md Files

### When to Update

Update `claude.md` files when:
- ✅ Adding new major features
- ✅ Changing architecture
- ✅ Updating dependencies
- ✅ Modifying conventions
- ✅ Discovering new patterns
- ✅ Adding new services/APIs

### What to Include

**Do include**:
- ✅ Architecture decisions
- ✅ Code conventions
- ✅ Common patterns
- ✅ Known issues
- ✅ Best practices
- ✅ Integration details

**Don't include**:
- ❌ Temporary code
- ❌ Personal notes
- ❌ Sensitive data
- ❌ Obvious information
- ❌ Duplicate content

### Format Guidelines

```markdown
# Clear Section Headings

## Subsections with Purpose

Use code blocks for examples:
```typescript
// With explanatory comments
const example = 'value';
```

Use lists for clarity:
- Point one
- Point two

Use tables for comparisons:
| Feature | Value |
|---------|-------|
| Name    | Data  |
```

## Benefits

### For Development
- 🚀 **Faster Onboarding**: New developers understand project quickly
- 🎯 **Consistent Code**: AI follows established patterns
- 📚 **Living Documentation**: Always up-to-date reference
- 🔍 **Better Debugging**: Context helps identify issues

### For AI Assistants
- 🤖 **Better Suggestions**: Context-aware recommendations
- ✨ **Accurate Code**: Matches project style
- 🛡️ **Fewer Errors**: Understands constraints
- 📖 **Comprehensive Help**: Full project knowledge

### For Teams
- 👥 **Shared Knowledge**: Centralized information
- 🔄 **Easier Reviews**: Context for code review
- 📝 **Documentation**: Single source of truth
- 🎓 **Training**: Onboarding resource

## Example Use Cases

### 1. Adding New Feature
**Scenario**: Add new API endpoint

**AI reads**:
- Existing endpoint patterns in `server/claude.md`
- Route organization structure
- Error handling conventions
- Response format standards

**Result**: AI generates code that matches existing patterns

### 2. Fixing Bug
**Scenario**: Debug streaming issue

**AI references**:
- Streaming implementation details
- SSE format specifications
- Error handling approach
- Common issues section

**Result**: AI provides targeted solution

### 3. Refactoring Code
**Scenario**: Improve service layer

**AI considers**:
- Current architecture
- Design patterns in use
- Dependencies and constraints
- Performance considerations

**Result**: AI suggests improvements that fit architecture

### 4. Code Review
**Scenario**: Review pull request

**AI checks against**:
- Coding standards
- Naming conventions
- Error handling
- Type safety

**Result**: AI provides consistent feedback

## Integration with Other Tools

### VS Code
Use with Copilot or Cody:
- AI reads `claude.md` for context
- Suggestions match project style
- Code completion uses patterns

### GitHub Copilot
Copilot can reference:
- Project conventions
- Common patterns
- Best practices

### Other AI Tools
Compatible with:
- Cursor AI
- Tabnine
- CodeWhisperer

## Best Practices

### Keep It Updated
- Review monthly
- Update with major changes
- Remove outdated info
- Add new patterns

### Be Concise
- Focus on important info
- Avoid redundancy
- Use clear language
- Provide examples

### Structure Well
- Logical sections
- Clear headings
- Easy to navigate
- Quick to reference

### Make It Useful
- Actionable information
- Real-world examples
- Common scenarios
- Troubleshooting tips

## Template Structure

Good `claude.md` structure:

```markdown
# Project Name - Context for Claude

## Overview
Brief description

## Architecture
System design

## Tech Stack
Technologies used

## File Structure
Directory layout

## Key Concepts
Important patterns

## Coding Standards
Conventions to follow

## Common Tasks
Frequent operations

## API Specification
Endpoint details

## Development
Setup and workflow

## Debugging
Troubleshooting guide

## Resources
Useful links
```

## Customization

Adapt `claude.md` to your needs:

### For Small Projects
- Single file at root
- Focus on essentials
- Keep it brief

### For Large Projects
- Multiple files per module
- Detailed documentation
- Component-specific guides

### For Teams
- Include team conventions
- Communication patterns
- Review processes

### For Solo Development
- Personal reminders
- Learning notes
- Experimental ideas

## Comparison with Traditional Docs

### claude.md
- ✅ AI-readable format
- ✅ Context-aware
- ✅ Pattern-focused
- ✅ Living document
- ✅ Quick reference

### README.md
- ✅ User-focused
- ✅ Getting started
- ✅ Installation
- ✅ Basic usage
- ✅ Marketing

### Technical Docs
- ✅ Comprehensive
- ✅ API details
- ✅ Formal
- ✅ Versioned
- ✅ External

**Use all three** for complete documentation

## Conclusion

`claude.md` files are a powerful tool for:
- Maintaining project knowledge
- Enabling AI-assisted development
- Onboarding developers
- Ensuring consistency

They work best when:
- Kept up-to-date
- Well-structured
- Focused on patterns
- Easy to navigate

**Remember**: These files are for AI context, not replacing traditional documentation. Use them alongside README, technical docs, and code comments for best results.
