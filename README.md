# Hackademia.uz

A hacker-themed desktop interface built with Next.js, featuring a Matrix-inspired design with draggable windows, multiple themes, and Supabase authentication.

## Features

- 🖥️ Desktop-like interface with draggable, resizable windows
- 🎨 Multiple themes: Dark, Light, and 2 Cyberpunk variants
- 🔐 Supabase authentication and database
- 🎯 Zustand state management
- ⚡ Next.js 15 with App Router
- 🎭 Matrix/Hacker aesthetic with monospace fonts
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd hackademia-uz
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Fill in your Supabase credentials
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
hackademia-uz/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── public/             # Static assets
\`\`\`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
