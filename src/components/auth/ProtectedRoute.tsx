// src/components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/src/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, useState, useRef } from 'react';
import { Spinner } from '../Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}


export default function ProtectedRoute({ 
  children, 
  allowedRoles = [] 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Use these refs to prevent multiple redirects
  const redirectingRef = useRef(false);
  const hasRenderedRef = useRef(false);
  
  // Use a state with intentional delay for better UX
  const [readyToRender, setReadyToRender] = useState(false);
  
  
  // Add a delay before initial redirect to prevent flash of protected content
  useEffect(() => {
    // Only set this once
    if (!hasRenderedRef.current) {
      const timer = setTimeout(() => {
        setReadyToRender(true);
        hasRenderedRef.current = true;
      }, 300); // Small delay to allow auth state to be fully determined
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle auth state changes and redirects
  useEffect(() => {
    // Prevent any action while loading or before ready
    if (isLoading || !readyToRender) {
      return;
    }
    
    // Prevent duplicate redirects
    if (redirectingRef.current) {
      return;
    }

    
    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
      redirectingRef.current = true;
      router.push(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // If authenticated but not allowed (role check)
    if (isAuthenticated && user && allowedRoles.length > 0) {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
        redirectingRef.current = true;
        router.push('/sign-in');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles, readyToRender]);
  
  // Show loading state while checking auth or during the initial delay
  if (isLoading || !readyToRender) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>  
    );
  }
  
  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }
  
  // If role check is needed and user doesn't have permission
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }
  
  // If all checks pass, render the children
  return <>{children}</>;
}