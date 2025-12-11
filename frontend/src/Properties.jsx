import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './Components/StatusBadge.jsx';
import { Card, CardContent } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import { Building2, Plus, Edit, Trash2, MapPin, Eye, Upload } from 'lucide-react';
import { useToast } from './Components/ToastContext.jsx';
import api from './axios.js';
import { UserContext } from './Context/UserContext.jsx';

const filters = ['all', 'verified', 'unverified'];

export default function Properties() {
  const navigate = useNavigate();
  const { userProfile } = useContext(UserContext);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/properties/all');
        if (!isMounted) return;
        const mine = (data || []).filter((p) => !userProfile?.ic || p.landlordIc === userProfile.ic);
        setProperties(mine);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load properties');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userProfile?.ic]);

  // Verification state is tracked on property.verification; availability (e.g., "available")
  // is separate and should not drive the badge.
  const verificationStatus = (property) => {
    const v = property.verification?.status;
    if (v === 'verified') return 'verified';
    if (v === 'rejected') return 'rejected';
    if (v === 'pending') return 'verification_pending';
    return 'unverified';
  };

  const myProperties = useMemo(() => {
    if (filter === 'all') return properties;
    const isVerified = filter === 'verified';
    return properties.filter((p) => {
      const v = verificationStatus(p);
      return isVerified ? v === 'verified' : v !== 'verified';
    });
  }, [properties, filter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/properties/${deleteId}/delete`);
      setProperties((prev) => prev.filter((p) => String(p.id) !== String(deleteId)));
      toast({
        title: 'Property deleted',
        description: 'The property has been removed from your listings.',
        variant: 'success',
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Loading properties...</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              My Properties
            </h1>
            <p className="text-muted-foreground">Manage your rental properties</p>
          </div>
          <Button variant="accent" onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        <div className="flex items-center gap-2 border-b">
          {filters.map((f) => {
            const label = f.charAt(0).toUpperCase() + f.slice(1);
            const count =
              f === 'all'
                ? properties.length
                : properties.filter((p) => (f === 'verified' ? verificationStatus(p) === 'verified' : verificationStatus(p) !== 'verified'))
                    .length;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {myProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {filter === 'all' ? 'No Properties Yet' : filter === 'verified' ? 'No Verified Properties' : 'No Unverified Properties'}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {filter === 'all'
                  ? 'Add your first property to start receiving tenant applications.'
                  : filter === 'verified'
                  ? "You don't have any verified properties yet."
                  : 'All your properties are verified.'}
              </p>
              {filter === 'all' && (
                <Button variant="accent" onClick={() => navigate('/properties/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myProperties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-40 md:h-auto bg-muted flex-shrink-0">
                      <img src={property.photos[0] || '/placeholder.svg'} alt={property.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{property.title}</h3>
                              <StatusBadge status={verificationStatus(property)} />
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-accent">RM {property.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">per month</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-4">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/listing/${property.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {verificationStatus(property) === 'verified' ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/properties/${property.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(property.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        ) : property.verification?.status === 'pending' ? null : (
                          <Button variant="accent" size="sm" onClick={() => navigate(`/properties/${property.id}/verification`)}>
                            <Upload className="h-4 w-4 mr-2" />
                            {property.verification?.status === 'rejected' ? 'Resubmit Documents' : 'Complete Ownership Verification'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Property</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this property? This action cannot be undone. Any active applications or contracts will also
                be affected.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

