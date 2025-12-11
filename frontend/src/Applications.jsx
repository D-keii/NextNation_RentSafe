import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import { ClipboardList, ArrowRight, Building2, Calendar, User } from 'lucide-react';
import api from './axios.js';
import { UserContext } from './Context/UserContext.jsx';

export default function Applications() {
  const navigate = useNavigate();
  const { userProfile } = useContext(UserContext);
  const [statusFilter, setStatusFilter] = useState('all');
  const user = userProfile || {};
  const isLandlord = user?.role === 'landlord';
  const [applications, setApplications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: dashboard } = await api.get(`/users/${user.ic}/landlord-dashboard`);
        if (!isMounted) return;
        const myProps = dashboard?.myProperties || [];
        setProperties(myProps);

        const appLists = await Promise.all(
          myProps.map((p) => api.get(`/properties/${p.id}/applications`).then((res) => res.data))
        );
        const flattened = appLists.flat().map((app) => ({
          ...app,
          property: app.property || myProps.find((p) => String(p.id) === String(app.propertyId)),
        }));
        setApplications(flattened);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load applications');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isLandlord && user.ic) {
      loadApplications();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isLandlord, user.ic]);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === 'pending').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
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

        <div className="flex items-center gap-2 border-b">
          {['all', 'pending', 'approved', 'rejected'].map((status) => {
            const label = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
            const count = statusCounts[status];
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Applications Yet</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => {
              const property = app.property || properties.find((p) => String(p.id) === String(app.propertyId));
              return (
                <Card key={app.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-32 md:h-auto bg-muted flex-shrink-0">
                        <img
                          src={property?.photos?.[0] || '/placeholder.svg'}
                          alt={property?.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
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
                          <p className="text-lg font-semibold text-accent">RM {property?.price?.toLocaleString()}/mo</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLandlord && app.status === 'pending' ? (
                            <Button variant="accent" size="sm" onClick={() => navigate(`/applications/${app.id}/review`)}>
                              Review Application
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => navigate(`/listing/${app.propertyId}`)}>
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
  );
}

