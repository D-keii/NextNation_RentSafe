import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties } from '@/data/mockData';
import { Building2, Plus, Edit, Trash2, MapPin, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type FilterType = 'all' | 'verified' | 'unverified';

export default function Properties() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter properties for this landlord
  const allMyProperties = mockProperties.filter((p) => p.landlordIc === '800515-01-5678');

  // Apply verification filter
  const myProperties = useMemo(() => {
    if (filter === 'all') return allMyProperties;
    if (filter === 'verified') return allMyProperties.filter((p) => p.status === 'verified');
    return allMyProperties.filter((p) => p.status === 'unverified');
  }, [allMyProperties, filter]);

  const handleDelete = () => {
    toast.success('Property deleted successfully');
    setDeleteId(null);
  };

  const verificationStatus = (property: (typeof allMyProperties)[number]) => {
    if (property.status === 'verified') return 'verified';
    if (property.verification?.status === 'rejected') return 'rejected';
    if (property.verification?.status === 'pending') return 'verification_pending';
    // If no verification data exists (shouldn't happen in normal flow)
    return 'unverified';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              My Properties
            </h1>
            <p className="text-muted-foreground">
              Manage your rental properties
            </p>
          </div>
          <Button variant="accent" onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              filter === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            All ({allMyProperties.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              filter === 'verified'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Verified ({allMyProperties.filter((p) => p.status === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              filter === 'unverified'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Unverified ({allMyProperties.filter((p) => p.status === 'unverified').length})
          </button>
        </div>

        {myProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {filter === 'all' 
                  ? 'No Properties Yet'
                  : filter === 'verified'
                  ? 'No Verified Properties'
                  : 'No Unverified Properties'}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {filter === 'all'
                  ? 'Add your first property to start receiving tenant applications.'
                  : filter === 'verified'
                  ? 'You don\'t have any verified properties yet.'
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
                      <img
                        src={property.photos[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
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
                              {property.city && property.state 
                                ? `${property.city}, ${property.state}`
                                : 'Location not specified'}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-accent">
                              RM {property.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">per month</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {property.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        {property.verification?.status === 'rejected' && (
                          <p className="text-sm text-destructive">
                            Rejection reason: {property.verification.rejectionReason || 'Please re-upload documents.'}
                          </p>
                        )}
                        {property.verification?.status === 'pending' && (
                          <p className="text-sm text-muted-foreground">
                            Documents submitted. Verification is pending review.
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listing/${property.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {property.status === 'verified' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/properties/${property.id}/edit`)}
                              >
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
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}/verification`)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {property.verification?.status === 'rejected' 
                                ? 'Resubmit Documents'
                                : 'Complete Ownership Verification'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Property</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this property? This action cannot be undone.
                Any active applications or contracts will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
