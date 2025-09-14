import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EmailList from './pages/EmailList';
import EmailDetail from './pages/EmailDetail';
import Services from './pages/Services';
import Categories from './pages/Categories';
import Quotations from './pages/Quotations';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="emails" element={<EmailList />} />
              <Route path="emails/:id" element={<EmailDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="services" element={<Services />} />
              <Route path="quotations" element={<Quotations />} />
              <Route path="clients" element={<Clients />} />
              <Route path="calendar" element={<Calendar />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
