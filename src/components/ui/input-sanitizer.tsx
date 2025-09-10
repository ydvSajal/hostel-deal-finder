import { useCallback } from 'react';

export const useInputSanitizer = () => {
  const sanitizeText = useCallback((text: string): string => {
    if (!text) return '';
    
    // Remove potentially harmful characters and scripts
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }, []);

  const sanitizeEmail = useCallback((email: string): string => {
    if (!email) return '';
    
    // Basic email sanitization
    return email
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '')
      .trim();
  }, []);

  const sanitizePhoneNumber = useCallback((phone: string): string => {
    if (!phone) return '';
    
    // Allow only numbers, +, -, and spaces
    return phone
      .replace(/[^0-9+\-\s]/g, '')
      .trim();
  }, []);

  const sanitizeAlphanumeric = useCallback((text: string): string => {
    if (!text) return '';
    
    // Allow only alphanumeric characters, spaces, hyphens, underscores
    return text
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .trim();
  }, []);

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizePhoneNumber,
    sanitizeAlphanumeric,
  };
};

export default useInputSanitizer;