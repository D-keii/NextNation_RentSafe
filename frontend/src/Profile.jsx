import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Components/ui/card.jsx';
import { Label } from './Components/ui/label.jsx';
import Badge from './Components/ui/badge.jsx';
import { User, Shield, Home, Building2 } from 'lucide-react';
import { useContext } from 'react';
import { UserContext } from './Context/UserContext.jsx';

export default function Profile() {

  const {userProfile} = useContext(UserContext);

  return (
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
                  {userProfile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{userProfile?.name || 'User'}</h3>
                <Badge className="capitalize mt-1 inline-flex items-center gap-1">
                  {userProfile?.role === 'landlord' ? (
                    <Building2 className="h-3 w-3" />
                  ) : (
                    <Home className="h-3 w-3" />
                  )}
                  {userProfile?.role || 'tenant'}
                </Badge>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">IC Number</Label>
                <p className="font-medium">{userProfile?.ic || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Age</Label>
                <p className="font-medium">{userProfile?.age ? `${userProfile.age} years old` : '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{userProfile?.gender || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

