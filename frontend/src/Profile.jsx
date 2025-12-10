import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Components/ui/card.jsx';
import { Label } from './Components/ui/label.jsx';
import Badge from './Components/ui/badge.jsx';
import { User, Shield, Home, Building2 } from 'lucide-react';

// Mock user data (replace with real auth context when available)
const mockUser = {
  name: 'Tan Wei Ming',
  role: 'landlord',
  ic: '800515-01-5678',
  age: 38,
  gender: 'male',
};

export default function Profile() {
  const user = mockUser;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </h1>
          <p className="text-muted-foreground">View your verified information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Verified Information
            </CardTitle>
            <CardDescription>
              This information was verified through MyDigital ID and cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
                <Badge className="capitalize mt-1 inline-flex items-center gap-1">
                  {user?.role === 'landlord' ? (
                    <Building2 className="h-3 w-3" />
                  ) : (
                    <Home className="h-3 w-3" />
                  )}
                  {user?.role || 'tenant'}
                </Badge>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">IC Number</Label>
                <p className="font-medium">{user?.ic || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Age</Label>
                <p className="font-medium">{user?.age ? `${user.age} years old` : '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{user?.gender || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

