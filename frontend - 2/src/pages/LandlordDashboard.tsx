import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { mockProperties, mockApplications, mockContracts, mockEscrows } from '@/data/mockData';
import { Building2, Users, FileText, Wallet, Plus, ArrowRight, Image, MapPin, Edit, Eye, Trash2, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter data for this landlord (using mock data)
  const myProperties = mockProperties.filter((p) => p.landlordIc === '800515-01-5678');
  const landlordApplications = mockApplications.filter((app) => app.landlordIc === '800515-01-5678');
  const pendingApplications = landlordApplications.filter((app) => app.status === 'pending');
  const activeContracts = mockContracts.filter(
    (c) => c.landlordIc === '800515-01-5678' && c.status === 'active'
  );
  const pendingContracts = mockContracts.filter(
    (c) =>
      c.landlordIc === '800515-01-5678' &&
      (c.status === 'pending_signatures' || c.status === 'pending_photos' || c.status === 'pending_tenant_approval')
  );
  const securedEscrows = mockEscrows.filter(
    (e) => e.landlordIc === '800515-01-5678' && e.status === 'secured'
  );

  const totalEscrowAmount = securedEscrows.reduce((sum, e) => sum + e.amount, 0);
  const monthlyIncome = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0);

  const verificationStatus = (property: (typeof myProperties)[number]) => {
    if (property.status === 'verified') return 'verified';
    if (property.verification?.status === 'rejected') return 'rejected';
    if (property.verification?.status === 'pending') return 'verification_pending';
    return 'unverified';
  };

  const handleDelete = () => {
    toast.success('Property deleted successfully');
    setDeleteId(null);
  };

  const stats = [
    {
      label: 'My Properties',
      value: myProperties.length,
      icon: Building2,
      href: '/properties',
      color: 'text-primary',
    },
    {
      label: 'Pending Applications',
      value: pendingApplications.length,
      icon: Users,
      href: '/applications',
      color: 'text-warning',
    },
    {
      label: 'Active Contracts',
      value: activeContracts.length,
      icon: FileText,
      href: '/contracts',
      color: 'text-info',
    },
    {
      label: 'Escrow',
      value: `RM ${totalEscrowAmount.toLocaleString()}`,
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
            <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and tenants.</p>
          </div>
          <Button variant="accent" onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="group cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <Link to={stat.href}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className={`rounded-full bg-muted p-2 ${stat.color} flex-shrink-0`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold truncate">{stat.value}</p>
                      <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Monthly Rental Income */}
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-3 text-green-700 dark:text-green-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">Monthly Rental Income</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">RM {monthlyIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <section className="space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Pending Applications</h2>
              {pendingApplications.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-warning text-white text-xs font-semibold">
                  {pendingApplications.length}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/applications">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No pending applications.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((app) => {
                const property = mockProperties.find((p) => p.id === app.propertyId);
                return (
                  <Card key={app.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{property?.title}</h3>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Applicant: {app.tenantName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="sm" onClick={() => navigate(`/applications/${app.id}/review`)}>
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Contracts pending review */}
        <section className="space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Pending Contracts</h2>
              {pendingContracts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-warning text-white text-xs font-semibold">
                  {pendingContracts.length}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contracts">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {pendingContracts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No pending contracts.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingContracts.map((contract) => {
                const property = mockProperties.find((p) => p.id === contract.propertyId);
                return (
                  <Card key={contract.id}>
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <StatusBadge status={contract.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Tenant IC: {contract.tenantIc}
                          </p>
                          <p className="text-sm font-medium text-accent">
                            RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {/* Awaiting Photos: Show View Contract and Upload Photos */}
                        {contract.status === 'pending_photos' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                              <FileText className="h-4 w-4 mr-1" />
                              View Contract
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}/upload-photos`)}>
                              <Image className="h-4 w-4 mr-1" />
                              Upload Photos
                            </Button>
                          </>
                        )}
                        {/* Pending Tenant Approval: Only show View Contract (landlord waits for tenant approval) */}
                        {contract.status === 'pending_tenant_approval' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                        {/* Awaiting Signatures: Only show View Contract (signing happens inside) */}
                        {contract.status === 'pending_signatures' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                        {/* Active: Show View Contract */}
                        {contract.status === 'active' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* My Properties */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Properties</h2>
            <Button variant="ghost" asChild>
              <Link to="/properties">
                Manage Lisiting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {myProperties.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No properties yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProperties.slice(0, 3).map((property) => (
                <Card key={property.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={property.photos[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {property.housingType && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium capitalize">
                          {property.housingType}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-1 flex-1">{property.title}</h3>
                      <StatusBadge status={verificationStatus(property)} />
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {property.city && property.state 
                          ? `${property.city}, ${property.state}`
                          : 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.size} sqft</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xl font-bold text-accent">
                          RM {property.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listing/${property.id}`);
                          }}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {property.status === 'verified' ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/properties/${property.id}/edit`);
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(property.id);
                          }}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

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
