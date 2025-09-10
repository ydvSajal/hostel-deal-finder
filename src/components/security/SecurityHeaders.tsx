import { useEffect } from 'react';

// Security headers component to add client-side security measures
export const SecurityHeaders = () => {
  useEffect(() => {
    // Add security meta tags dynamically if they don't exist
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Add CSRF token meta tag
    const csrfToken = Math.random().toString(36).substring(2, 15);
    addMetaTag('csrf-token', csrfToken);
    
    // Store CSRF token for API requests
    window.csrfToken = csrfToken;

    // Clear sensitive data on page unload
    const handleBeforeUnload = () => {
      // Clear any sensitive form data
      const sensitiveInputs = document.querySelectorAll('input[type="password"], input[data-sensitive]');
      sensitiveInputs.forEach((input: any) => {
        input.value = '';
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null; // This component doesn't render anything
};

// Add CSRF token to global window type
declare global {
  interface Window {
    csrfToken?: string;
  }
}

export default SecurityHeaders;