import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties, mockApplications, mockEscrows } from '@/data/mockData';
import { Home, FileText, Wallet, Heart, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<string[]>(['prop-2']);

  const handleSave = (propertyId: string) => {
    setSavedListings((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Filter properties based on user preferences
  const recommendedProperties = mockProperties.filter((p) => {
    const meetsBudgetMin = user?.budgetMin ? p.price >= user.budgetMin : true;
    const meetsBudgetMax = user?.budgetMax ? p.price <= user.budgetMax : true;
    return p.available && meetsBudgetMin && meetsBudgetMax;
  });

  const pendingApplications = mockApplications.filter(
    (app) => app.tenantIc === user?.ic && app.status === 'pending'
  );

  const activeEscrows = mockEscrows.filter(
    (esc) => esc.tenantIc === user?.ic && esc.status === 'secured'
  );

  const stats = [
    {
      label: 'Saved Listings',
      value: savedListings.length,
      icon: Heart,
      href: '/saved',
      color: 'text-destructive',
    },
    {
      label: 'Applications',
      value: pendingApplications.length,
      icon: FileText,
      href: '/applications',
      color: 'text-warning',
    },
    {
      label: 'Active Escrows',
      value: activeEscrows.length,
      icon: Wallet,
      href: '/escrow',
      color: 'text-success',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Find your perfect rental today.</p>
          </div>
          <Button variant="accent" asChild>
            <Link to="/listings">
              <Search className="h-4 w-4 mr-2" />
              Browse All Listings
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="group cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-1"
              onClick={() => {}}
            >
              <Link to={stat.href}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Active Escrow Status */}
        {activeEscrows.length > 0 && (
          <Card className="border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Wallet className="h-5 w-5" />
                Escrow Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit Amount</p>
                  <p className="text-2xl font-bold">RM {activeEscrows[0].amount.toLocaleString()}</p>
                </div>
                <StatusBadge status="secured" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your deposit is securely held in escrow and will be released according to contract terms.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommended Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <p className="text-sm text-muted-foreground">
                {user?.preferredLocation || user?.budgetMin || user?.budgetMax
                  ? `Based on your filters: ${user?.preferredLocation ?? 'Any location'}, RM ${user?.budgetMin?.toLocaleString() ?? '—'} - RM ${user?.budgetMax?.toLocaleString() ?? '—'}`
                  : 'Set filters when searching to tailor recommendations.'}
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/listings">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.slice(0, 3).map((property, index) => (
              <div
                key={property.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard
                  property={property}
                  isSaved={savedListings.includes(property.id)}
                  onSave={handleSave}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Applications</h2>
            <div className="grid gap-4">
              {pendingApplications.map((app) => {
                const property = mockProperties.find((p) => p.id === app.propertyId);
                return (
                  <Card key={app.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{property?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied on {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
