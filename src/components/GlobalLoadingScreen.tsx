/**
 * Global Loading Screen
 * Blocks entire application until all data is loaded
 */

import React from 'react';
import { Loader2, Database, Users, CreditCard, Settings } from 'lucide-react';

interface LoadingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function GlobalLoadingScreen() {
  // Simulate loading steps for visual feedback
  const steps: LoadingStep[] = [
    {
      id: 'environment',
      label: 'Loading environment configuration...',
      icon: <Settings className="w-4 h-4" />,
      completed: false
    },
    {
      id: 'auth',
      label: 'Verifying authentication...',
      icon: <Users className="w-4 h-4" />,
      completed: false
    },
    {
      id: 'organizations',
      label: 'Loading organizations...',
      icon: <Database className="w-4 h-4" />,
      completed: false
    },
    {
      id: 'subscription',
      label: 'Loading subscription data...',
      icon: <CreditCard className="w-4 h-4" />,
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          {/* AUTANA Logo */}
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo/logo.png" 
              alt="AUTANA" 
              className="h-12 w-auto"
            />
          </div>
          
          <h1 className="text-2xl font-semibold mb-2">
            Initializing AUTANA
          </h1>
          <p className="text-muted-foreground text-sm">
            Loading your manufacturing management platform...
          </p>
        </div>

        {/* Main Loading Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30"
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {step.completed ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {step.icon}
                  </div>
                )}
              </div>
              <span 
                className={`text-sm ${
                  step.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {!step.completed && index === 0 && (
                <div className="ml-auto">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-500 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Setting up your workspace with AI-powered manufacturing tools
          </p>
        </div>
      </div>
    </div>
  );
}