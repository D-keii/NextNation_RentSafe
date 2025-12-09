import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties, mockApplications } from '@/data/mockData';
import { ClipboardList, ArrowRight, Building2, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const isLandlord = user?.role === 'landlord';

  // Filter applications based on role
  const applications = useMemo(
    () =>
      isLandlord
        ? mockApplications.filter((app) => app.landlordIc === '800515-01-5678')
        : mockApplications.filter((app) => app.tenantIc === user?.ic),
    [isLandlord, user?.ic]
  );

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === 'pending').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === 'all' ? true : app.status === statusFilter
  );


  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            {isLandlord ? 'Tenant Applications' : 'My Applications'}
          </h1>
          <p className="text-muted-foreground">
            {isLandlord
              ? 'Review and manage applications for your properties'
              : 'Track the status of your rental applications'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
            const label = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
            const count = statusCounts[status];
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Applications Yet</h3>             
              {!isLandlord && (
                <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                  Browse Listings
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => {
              const property = mockProperties.find((p) => p.id === app.propertyId);
              return (
                <Card key={app.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-48 h-32 md:h-auto bg-muted flex-shrink-0">
                        <img
                          src={property?.photos[0] || '/placeholder.svg'}
                          alt={property?.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <StatusBadge status={app.status} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {property?.city && property?.state 
                                ? `${property.city}, ${property.state}`
                                : 'Location not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                            {isLandlord && (
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {app.tenantName}
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-semibold text-accent">
                            RM {property?.price.toLocaleString()}/mo
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isLandlord && app.status === 'pending' ? (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => navigate(`/applications/${app.id}/review`)}
                            >
                              Review Application
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/listing/${app.propertyId}`)}
                            >
                              View Property
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
