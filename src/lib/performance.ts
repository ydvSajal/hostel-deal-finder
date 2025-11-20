/**
 * Performance monitoring utilities for tracking web vitals and custom metrics
 */

type MetricName = 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
  processingStart?: number;
  processingEnd?: number;
  hadRecentInput?: boolean;
  value?: number;
}

// Threshold values for web vitals (based on Google's recommendations)
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Log metric to console in development, send to analytics in production
function reportMetric(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
  } else {
    // In production, you could send to analytics service
    // Example: sendToAnalytics(metric);
  }
}

// First Contentful Paint (FCP)
export function measureFCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        const metric: Metric = {
          name: 'FCP',
          value: fcpEntry.startTime,
          rating: getRating('FCP', fcpEntry.startTime),
          delta: fcpEntry.startTime,
          id: `fcp-${Date.now()}`,
        };
        reportMetric(metric);
        observer.disconnect();
      }
    });
    
    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// Largest Contentful Paint (LCP)
export function measureLCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        const metric: Metric = {
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          delta: value,
          id: `lcp-${Date.now()}`,
        };
        reportMetric(metric);
      }
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// First Input Delay (FID)
export function measureFID() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const firstInput = entries[0];
      
      if (firstInput) {
        const delay = firstInput.processingStart && firstInput.startTime
          ? firstInput.processingStart - firstInput.startTime
          : 0;
          
        const metric: Metric = {
          name: 'FID',
          value: delay,
          rating: getRating('FID', delay),
          delta: delay,
          id: `fid-${Date.now()}`,
        };
        reportMetric(metric);
        observer.disconnect();
      }
    });
    
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// Cumulative Layout Shift (CLS)
export function measureCLS() {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      
      entries.forEach((entry) => {
        if (!entry.hadRecentInput && entry.value) {
          clsValue += entry.value;
        }
      });
      
      const metric: Metric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: clsValue,
        id: `cls-${Date.now()}`,
      };
      reportMetric(metric);
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// Time to First Byte (TTFB)
export function measureTTFB() {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const metric: Metric = {
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        delta: ttfb,
        id: `ttfb-${Date.now()}`,
      };
      reportMetric(metric);
    }
  } catch (e) {
    // Silently fail if not supported
  }
}

// Initialize all performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Measure metrics when DOM is ready
  if (document.readyState === 'complete') {
    measurePerformance();
  } else {
    window.addEventListener('load', measurePerformance);
  }
}

function measurePerformance() {
  measureFCP();
  measureLCP();
  measureFID();
  measureCLS();
  measureTTFB();
}

// Custom performance marks for specific operations
export function markPerformance(name: string) {
  if ('performance' in window && performance.mark) {
    performance.mark(name);
  }
}

export function measurePerformanceBetween(startMark: string, endMark: string, measureName: string) {
  if ('performance' in window && performance.measure) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      if (measure && import.meta.env.DEV) {
        console.log(`[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`);
      }
    } catch (e) {
      // Marks don't exist, silently fail
    }
  }
}

// Monitor long tasks (tasks taking > 50ms)
export function monitorLongTasks() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (import.meta.env.DEV) {
          console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    observer.observe({ type: 'longtask', buffered: true });
  } catch (e) {
    // Long task API not supported
  }
}
