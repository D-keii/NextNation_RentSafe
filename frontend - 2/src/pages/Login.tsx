import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck, Wallet } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.profileComplete) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    {
      icon: Shield,
      title: 'Verified Identity',
      description: 'All users verified through MyDigital ID',
    },
    {
      icon: Lock,
      title: 'Secure Escrow',
      description: 'Deposits protected until move-in',
    },
    {
      icon: FileCheck,
      title: 'Digital Contracts',
      description: 'Legally binding with digital signatures',
    },
    {
      icon: Wallet,
      title: 'Easy Payments',
      description: 'FPX and DuitNow supported',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="container py-6">
        <Logo size="lg" />
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex items-center justify-center py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          {/* Left Column - Info */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Rent with{' '}
                <span className="text-accent">confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Malaysia's trusted rental platform with verified identities, secure escrow, and digital contracts.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="rounded-lg bg-accent/10 p-2 mt-1">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Login Card */}
          <Card className="shadow-card-hover animate-scale-in">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl">Welcome to RentSafe</CardTitle>
              <CardDescription>
                Sign in securely with your MyDigital ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  variant="mydigital-id"
                  size="xl"
                  className="w-full"
                  onClick={login}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Login with MyDigital ID
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <a href="#" className="underline hover:text-foreground">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-foreground">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">How it works</span>
                </div>
              </div>

              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    1
                  </span>
                  Click "Login with MyDigital ID"
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    2
                  </span>
                  Verify your identity in the MyDigital ID app
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    3
                  </span>
                  Complete your profile and start renting
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-6 text-center text-sm text-muted-foreground">
        © 2024 RentSafe. All rights reserved.
      </footer>
    </div>
  );
}
