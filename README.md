# Unlimited Gmail Generator

> **Live Website:** [https://unlimitedgmailgenerator.vercel.app/](https://unlimitedgmailgenerator.vercel.app/)

A modern, privacy-first, client-side Gmail Dot Alias Generator and account credential organizer.

## Features

- **Combinatorial Dot Generator**: Instantly generates all $2^{n-1}$ unique dot-variant aliases for any valid Gmail address using the official Gmail dot trick.
- **100% Client-Side Privacy**: Zero backend databases. All aliases, projects, and credentials are stored strictly in the user's browser `localStorage`.
- **Project & Account Vault**: Organize aliases by platform (e.g., Netflix, Twitter/X, Stripe, Testing) with custom notes, usernames, login URLs, and masked passwords.
- **Status Lifecycle Tracking**: Track accounts as *Unused*, *Created*, *Active*, or *Disabled*.
- **Quick Copy & Bulk Operations**: One-click copy with animated feedback, search filter, and bulk-save modal.
- **Backup & Restore**: Export and import complete backups via JSON (with Safe and Full export modes).

## Tech Stack

- **Framework**: React 18 + Vite 7 + TypeScript
- **Routing**: `@tanstack/react-router`
- **Styling**: Tailwind CSS + Custom Frosted Glassmorphism
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
