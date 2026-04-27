# Commit Message Guidelines

## Format
Prefers a simple format, often starting with a type but without strict adherence to conventional commits. Generally lacks scopes.

## Style Rules
- **Tense**: Mixed, but often uses present tense for new features or a gerund form (e.g., "added", "update").
- **Capitalization**: First letter is often capitalized, but not consistently.
- **Length**: Variable, can be concise or descriptive.
- **Tone**: Technical and direct.

## Commit Types
- `feat`: Used for new features or significant additions.
- `update`: Used for modifications or enhancements to existing functionality.
- (Implied) `chore`: For setup, dependencies, and project-level changes.

## Scope Usage
No scopes are consistently used. When used, it seems implied within the description rather than in parentheses.

## Description Patterns
Descriptions often include the primary change followed by details about what was affected (e.g., "components", "schemas"). Sometimes includes dependency additions or project setup.

## Examples from History
- feat: add react-markdown dependency and update layout and home page components
- feat: integrate better-auth for authentication and update schemas
- feat: fix the backend tsc build
- update: render config
- added husky
- project setup