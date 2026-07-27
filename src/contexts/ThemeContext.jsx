import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// The site now ships with a single, permanent light theme — there is no
// user-facing switcher. This provider is kept (rather than removed outright)
// so existing components that read `isDarkMode` keep working, but it always
// resolves to light and ignores any stale 'theme' value a browser may have
// saved from an earlier version of the site.
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('theme');
  }, []);

  const value = {
    isDarkMode: false,
    toggleTheme: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
