"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface AttentionMetrics {
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
  focusTime: number;
  attentionScore: number;
  startTime: number;
  lastActivity: number;
}

export function useAttentionTracking() {
  const [metrics, setMetrics] = useState<AttentionMetrics>({
    timeSpent: 0,
    scrollDepth: 0,
    interactions: 0,
    focusTime: 0,
    attentionScore: 0,
    startTime: 0,
    lastActivity: 0,
  });

  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());

  const startTracking = useCallback(() => {
    setIsTracking(true);
    startTimeRef.current = Date.now();
    lastActivityRef.current = Date.now();
    
    setMetrics(prev => ({
      ...prev,
      startTime: Date.now(),
      lastActivity: Date.now(),
    }));

    // Track time every second
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
      
      setMetrics(prev => ({
        ...prev,
        timeSpent,
        lastActivity: lastActivityRef.current,
      }));
    }, 1000);

    // Track user activity
    const trackActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add event listeners
    document.addEventListener('mousemove', trackActivity);
    document.addEventListener('click', trackActivity);
    document.addEventListener('scroll', trackActivity);
    document.addEventListener('keypress', trackActivity);

    return () => {
      document.removeEventListener('mousemove', trackActivity);
      document.removeEventListener('click', trackActivity);
      document.removeEventListener('scroll', trackActivity);
      document.removeEventListener('keypress', trackActivity);
    };
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const focusTime = Math.floor((lastActivityRef.current - startTimeRef.current) / 1000);
    
    // Calculate attention score (0-100)
    const attentionScore = Math.min(100, Math.floor((focusTime / finalTimeSpent) * 100));

    setMetrics(prev => ({
      ...prev,
      timeSpent: finalTimeSpent,
      focusTime,
      attentionScore,
    }));

    return {
      timeSpent: finalTimeSpent,
      focusTime,
      attentionScore,
    };
  }, []);

  const updateScrollDepth = useCallback((depth: number) => {
    setMetrics(prev => ({
      ...prev,
      scrollDepth: Math.max(prev.scrollDepth, depth),
    }));
  }, []);

  const incrementInteractions = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      timeSpent: 0,
      scrollDepth: 0,
      interactions: 0,
      focusTime: 0,
      attentionScore: 0,
      startTime: 0,
      lastActivity: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    isTracking,
    startTracking,
    stopTracking,
    updateScrollDepth,
    incrementInteractions,
    resetMetrics,
  };
}



