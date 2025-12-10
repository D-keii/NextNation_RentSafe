import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { Home, Building2, ArrowRight } from 'lucide-react';

export default function ProfileSetup() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState<UserRole | null>(user?.role ?? null);

  const handleSubmit = () => {
    if (!role) return;
    
    completeProfile(role);
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="container py-6">
        <Logo size="lg" />
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-card-hover animate-scale-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Welcome, {user?.name}! Let's set up your preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Auto-filled Info */}
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Verified Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IC Number</Label>
                  <p className="font-medium">{user?.ic}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Age</Label>
                  <p className="font-medium">{user?.age} years old</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium capitalize">{user?.gender}</p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base">I am a...</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    role === 'tenant'
                      ? 'border-accent bg-accent/5 shadow-glow'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`rounded-full p-3 mb-3 ${role === 'tenant' ? 'bg-accent/10' : 'bg-muted'}`}>
                    <Home className={`h-8 w-8 ${role === 'tenant' ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="font-semibold">Tenant</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Looking for a place to rent
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                    role === 'landlord'
                      ? 'border-accent bg-accent/5 shadow-glow'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`rounded-full p-3 mb-3 ${role === 'landlord' ? 'bg-accent/10' : 'bg-muted'}`}>
                    <Building2 className={`h-8 w-8 ${role === 'landlord' ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="font-semibold">Landlord</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    I have properties to rent out
                  </p>
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!role}
            >
              Complete Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
