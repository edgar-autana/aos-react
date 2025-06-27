# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# AOS React

A React application with Supabase integration for customer and supplier management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up your Supabase database with the following table:

### tb_company table
```sql
CREATE TABLE tb_company (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_atos TEXT,
  name TEXT NOT NULL,
  description TEXT,
  created_at_atos TIMESTAMP WITH TIME ZONE,
  url TEXT,
  phone TEXT,
  presentation TEXT,
  status TEXT,
  enabled BOOLEAN DEFAULT true,
  slug TEXT,
  address TEXT,
  image TEXT,
  nda_signed DATE,
  hs_company_id TEXT
);
```

4. Run the development server:
```bash
npm run dev
```

## Architecture

The application follows a clean architecture pattern with Supabase integration:

- **`src/lib/supabase.ts`**: Supabase client configuration and TypeScript types
- **`src/services/company/companyApi.ts`**: Supabase API service layer with CRUD operations
- **`src/hooks/company/useCompanies.ts`**: Custom React hooks for data management
- **`src/utils/company/companyTransformers.ts`**: Data transformation utilities between database and UI formats

## Features

- Customer management with CRUD operations
- Real-time data from Supabase
- Responsive UI with shadcn/ui components
- Search and filtering capabilities
- Transaction history tracking

## Supabase Integration

The app uses Supabase for:
- Database operations (CRUD)
- Real-time subscriptions
- Authentication (ready to implement)
- File storage (ready to implement)

All database operations are performed directly through the Supabase client using the pattern:
```typescript
const { data, error } = await supabase
  .from('tb_company')
  .select('*')
```
