# OMA Digital Platform Landing Page

This is a code bundle for OMA Digital Platform Landing Page. The original project is available at https://www.figma.com/design/TXaPIZ5SOYWgng1jE44Cto/OMA-Digital-Platform-Landing-Page.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Supabase Configuration

To connect the chatbot to Supabase remotely:

1. Create a `.env.local` file in the root directory (see `.env.example` for template)
2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. For local development, you can use:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```

The chatbot will now store and retrieve conversations from Supabase.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Comprehensive guide for developers
- [API Documentation](docs/API_DOCUMENTATION.md) - Detailed API endpoints and usage
- [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md) - System architecture and design patterns

## Testing

Run the test suite with:
```bash
npm test
```

For continuous testing during development:
```bash
npm run test:watch
```

## Deployment

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

# OMA Digital - Clean and Secure Repository Setup

This repository has been initialized with a clean and secure setup, following best practices for Git repository management.

## Repository Security Features

- Comprehensive [.gitignore](file:///C:/Users/fallp/Music/OMADIGITAL/.gitignore) file to prevent sensitive files from being tracked
- Environment variable templates (.env.example) instead of actual environment files
- Security-focused file exclusions for certificates, keys, and other sensitive data
- Proper separation of configuration and secrets

## Branch Information

- Default branch: `main`
- All development work should be done in feature branches and merged via pull requests

## Initial Commit

This repository was created with a clean initial commit containing only essential project files to ensure a secure and manageable codebase from the start.

## Best Practices

1. Never commit sensitive information (passwords, API keys, certificates)
2. Use environment variables for configuration
3. Keep dependencies up to date
4. Regularly audit the codebase for security issues
5. Follow the existing code structure and patterns
