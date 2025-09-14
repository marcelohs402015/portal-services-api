# 📧 Email Attendant - React Frontend

Frontend of the **Portal Services** application built with React 18, TypeScript and Tailwind CSS, featuring **English interface** with professional service provider terminology.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## ✨ Implemented Features

### 🌐 English Interface System
- **Professional English**: Complete interface for service providers
- **react-i18next**: Translation management framework
- **Consistent terminology**: Industry-standard service terms
- **Professional communication**: Email templates and client messaging
- **Complete translations**: All interface texts in English

### 🎨 Interface and Components
- **Responsive layout** with side navigation
- **Executive dashboard** with statistics
- **CRUD system** for all entities
- **Interactive modals** for forms
- **Consistent color system**

### 🌍 Translation System
- `src/locales/en.json` - English interface translations
- `src/i18n.ts` - i18n system configuration (English-only)
- `src/data/mockEmails.ts` - English email mock data

## 📋 Available Scripts

In the project directory, you can run:

### `npm start` or `npm run dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

**🌐 English Interface:**
- Professional service provider terminology
- Consistent English throughout the application
- Industry-standard communication templates

### `npm test`

Launches the test runner in interactive watch mode.\
Includes tests to validate English interface consistency.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run typecheck`

Checks TypeScript types without outputting files.\
Useful for validating TypeScript types and English interface consistency.

## 📚 Learn More

### 🌐 Internationalization
- [React-i18next Documentation](https://react.i18next.com/) - Complete translation library guide
- [i18next Documentation](https://www.i18next.com/) - Base internationalization framework

### ⚛️ React and Development
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) - Official CRA documentation
- [React documentation](https://reactjs.org/) - Learn React

### 🎨 Technologies Used
- [TypeScript](https://www.typescriptlang.org/) - Static typing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Query](https://tanstack.com/query) - Server state management
- [Heroicons](https://heroicons.com/) - Icon library

## 🚀 Main File Structure

```
src/
├── components/
│   ├── Layout.tsx           # Main layout with navigation
│   └── [Other components]   # 🌐 English interface components
├── pages/                   # Application pages
│   ├── Dashboard.tsx        # Main dashboard
│   ├── EmailList.tsx        # Email list
│   └── ...
├── locales/                 # 🌐 English translations
│   └── en.json             #     English interface
├── i18n.ts                 # 🌐 react-i18next config (English-only)
├── services/               # API client
└── data/                   # Mock data
```