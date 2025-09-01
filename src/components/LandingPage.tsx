import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Brain, 
  Building2, 
  Users, 
  Star,
  Shield,
  Cpu,
  Eye,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Static plans data to avoid authentication issues on landing page
const STATIC_PLANS = [
  {
    id: "starter",
    name: "starter",
    display_name: "Starter Plan",
    tier: 1,
    max_organizations: 1,
    max_users_per_org: 2,
    max_ai_requests_per_month: 100,
    price_monthly: 29.99,
    features: {
      features: ["Basic AI Analysis", "1 Organization", "2 Users", "100 AI Requests/month"]
    }
  },
  {
    id: "professional", 
    name: "professional",
    display_name: "Professional Plan",
    tier: 2,
    max_organizations: 2,
    max_users_per_org: 5,
    max_ai_requests_per_month: 500,
    price_monthly: 79.99,
    features: {
      features: ["Advanced AI Analysis", "2 Organizations", "5 Users", "500 AI Requests/month", "Priority Support"]
    }
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [plans, setPlans] = useState(STATIC_PLANS);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = (planId?: string) => {
    if (isSignedIn) {
      // If already signed in, go to onboarding to select plan
      navigate('/onboarding');
    } else {
      // If not signed in, go to registration
      navigate('/sign-up');
    }
  };

  const getPlanIcon = (tier: number) => {
    return tier === 1 ? <Zap className="w-8 h-8" /> : <Brain className="w-8 h-8" />;
  };

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "AI Vision Analysis",
      description: "Advanced computer vision analyzes technical drawings and 3D models with precision"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Intelligence",
      description: "Extract materials, processes, and specifications from manufacturing documents"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Smart Processing",
      description: "Automated cost estimation and manufacturability analysis powered by AI"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Process Optimization",
      description: "Intelligent recommendations for manufacturing processes and material selection"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and data encryption"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Multi-Organization",
      description: "Manage multiple organizations and teams with role-based access control"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <img 
              src="/logo/logo.png" 
              alt="AUTANA"
              className="h-8"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Pricing
            </Button>
            
            {isSignedIn ? (
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/sign-in')} variant="ghost">
                  Sign In
                </Button>
                <Button onClick={() => handleGetStarted()}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              AUTANA
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              AI-Powered Manufacturing Intelligence
            </p>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your manufacturing workflow with advanced AI that analyzes technical drawings, 
              extracts specifications, estimates costs, and optimizes processes—all in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={() => handleGetStarted()} 
                size="lg" 
                className="text-lg px-8 py-3"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-3"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Trusted by Engineers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our cutting-edge artificial intelligence transforms how you analyze and process manufacturing data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-primary" })}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start your AI-powered manufacturing journey today. Upgrade or downgrade anytime.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const isProfessional = plan.tier === 2;
                
                return (
                  <Card 
                    key={plan.id}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                      isProfessional && "border-primary shadow-md"
                    )}
                  >
                    {isProfessional && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg">
                        RECOMMENDED
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <div className={cn(
                        "mx-auto mb-4 p-3 rounded-full",
                        isProfessional ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {getPlanIcon(plan.tier)}
                      </div>
                      <CardTitle className="text-2xl mb-2">{plan.display_name}</CardTitle>
                      <CardDescription className="text-3xl font-bold text-foreground">
                        ${plan.price_monthly}
                        <span className="text-base font-normal text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Features */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">
                            <strong className="text-foreground">{plan.max_organizations}</strong> Organization{plan.max_organizations > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            <strong className="text-foreground">{plan.max_users_per_org}</strong> Users per organization
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Brain className="w-4 h-4" />
                          <span className="text-sm">
                            <strong className="text-foreground">{plan.max_ai_requests_per_month}</strong> AI analyses/month
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="border-t pt-4 space-y-2">
                        {plan.features.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        className={cn(
                          "w-full",
                          isProfessional ? "text-lg py-3" : "text-lg py-3"
                        )}
                        variant={isProfessional ? "default" : "outline"}
                        onClick={() => handleGetStarted(plan.id)}
                      >
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              🔒 <strong>No credit card required.</strong> 30-day free trial on all plans.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Manufacturing Process?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of engineers and manufacturers who trust AUTANA to streamline their workflows.
          </p>
          <Button 
            onClick={() => handleGetStarted()}
            size="lg" 
            className="text-lg px-8 py-3"
          >
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 bg-background/95">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/logo/logo.png" 
              alt="AUTANA"
              className="h-6"
            />
          </div>
          <p className="text-sm">
            © 2025 AUTANA. All rights reserved. | AI-Powered Manufacturing Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}