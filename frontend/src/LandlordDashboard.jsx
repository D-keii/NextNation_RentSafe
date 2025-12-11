import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users, FileText, Wallet, Plus, ArrowRight, MapPin, Edit, Eye, Trash2, DollarSign, Image } from 'lucide-react';
import StatusBadge from './Components/StatusBadge';
import propertyImage from './img/property-image.jpg';
import api from './axios.js';
import { UserContext } from './Context/UserContext.jsx';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useContext(UserContext);
  const [deleteId, setDeleteId] = useState(null);
  const landlordIc = userProfile?.ic || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    myProperties: [],
    pendingApplications: [],
    activeContracts: [],
    pendingContracts: [],
    securedEscrows: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/users/${landlordIc}/landlord-dashboard`);
        if (!isMounted) return;
        setDashboardData({
          myProperties: data?.myProperties || [],
          pendingApplications: data?.pendingApplications || [],
          activeContracts: data?.activeContracts || [],
          pendingContracts: data?.pendingContracts || [],
          securedEscrows: data?.securedEscrows || [],
        });
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [landlordIc]);

  const { myProperties, pendingApplications, activeContracts, pendingContracts, securedEscrows } = dashboardData;

  const monthlyIncome = useMemo(
    () => activeContracts.reduce((sum, c) => sum + (Number(c.monthlyRent) || 0), 0),
    [activeContracts]
  );
  const totalEscrowAmount = useMemo(
    () => securedEscrows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [securedEscrows]
  );

  const verificationStatus = (property) => {
    if (property.status === 'verified') return 'verified';
    if (property.verification?.status === 'rejected') return 'rejected';
    if (property.verification?.status === 'pending') return 'verification_pending';
    return 'unverified';
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/properties/${deleteId}/delete`);
      const updated = myProperties.filter((p) => String(p.id) !== String(deleteId));
      setDashboardData((prev) => ({ ...prev, myProperties: updated }));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      // Handle error
    }
  };

  const stats = [
    { label: 'My Properties', value: myProperties.length, icon: Building2, href: '/properties', color: 'text-primary' },
    { label: 'Pending Applications', value: pendingApplications.length, icon: Users, href: '/applications/list', color: 'text-warning' },
    { label: 'Active Contracts', value: activeContracts.length, icon: FileText, href: '/contracts', color: 'text-info' },
    { label: 'Escrow', value: `RM ${totalEscrowAmount.toLocaleString()}`, icon: Wallet, href: '/escrow', color: 'text-success' },
  ];

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 md:p-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 flex flex-col space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and tenants.</p>
        </div>
        <button
          onClick={() => navigate('/properties/new')}
          className="flex items-center gap-2 bg-accent text-white font-semibold rounded-md px-4 py-2 hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Add New Property
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="flex flex-row border-2 justify-between p-6 rounded-lg items-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <h1 className="font-bold text-3xl">{stat.value}</h1>
            </div>
            <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Monthly Rental Income */}
      <div className="rounded-md border border-success/20 bg-success/5 p-5 flex flex-col space-y-3">
        <p className="flex flex-row items-center text-accent font-bold text-2xl">
          <DollarSign className="mr-3" />
          Monthly Rental Income
        </p>
        <div className="flex flex-row items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">RM {monthlyIncome.toLocaleString()}</h1>
            <p className="text-muted-foreground">Total monthly income from active contracts</p>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Pending Applications</h2>
            {pendingApplications.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-warning text-white text-xs font-semibold">
                {pendingApplications.length}
              </span>
            )}
          </div>
          <Link to="/applications/list" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pendingApplications.length === 0 ? (
          <div className="border-2 p-6 rounded-lg text-sm text-muted-foreground">
            No pending applications.
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {pendingApplications.map((app) => {
                  const property = app.property || myProperties.find((p) => String(p.id) === String(app.propertyId));
              return (
                    <div key={app.id} className="flex flex-row justify-between items-center border-2 p-4 rounded-xl">
                  <div className="flex flex-row items-center space-x-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={property?.photos?.[0] || propertyImage}
                        alt={property?.title || 'Property'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{property?.title || 'Property'}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applicant: {app.tenantName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/applications/${app.id}/review`)}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition"
                  >
                    Review
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Contracts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Pending Contracts</h2>
            {pendingContracts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-warning text-white text-xs font-semibold">
                {pendingContracts.length}
              </span>
            )}
          </div>
          <Link
            to="/contracts"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pendingContracts.length === 0 ? (
          <div className="border-2 p-6 rounded-lg text-sm text-muted-foreground">
            No pending contracts.
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {pendingContracts.map((contract) => {
              const property = myProperties.find((p) => p.id === contract.propertyId);
              return (
                <div key={contract.id} className="border-2 p-4 rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={property?.photos?.[0] || propertyImage}
                          alt={property?.title || 'Property'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{property?.title || 'Property'}</h3>
                          <StatusBadge status={contract.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tenant IC: {contract.tenantIc || 'N/A'}
                        </p>
                        <p className="text-sm font-medium text-accent">
                          RM {Number(contract.monthlyRent || 0).toLocaleString()}/mo — Deposit RM {Number(contract.depositAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {contract.status === 'pending_photos' && (
                        <>
                          <button
                            onClick={() => navigate(`/contracts/${contract.id}`)}
                            className="px-3 py-1.5 border rounded-md text-sm hover:bg-muted transition"
                          >
                            <FileText className="h-4 w-4 inline mr-1" />
                            View Contract
                          </button>
                          <button
                            onClick={() => navigate(`/contracts/${contract.id}/upload-photos`)}
                            className="px-3 py-1.5 border rounded-md text-sm hover:bg-muted transition"
                          >
                            <Image className="h-4 w-4 inline mr-1" />
                            Upload Photos
                          </button>
                        </>
                      )}
                      {(contract.status === 'pending_tenant_approval' || 
                        contract.status === 'pending_signatures' || 
                        contract.status === 'active') && (
                        <button
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                          className="px-3 py-1.5 border rounded-md text-sm hover:bg-muted transition"
                        >
                          <FileText className="h-4 w-4 inline mr-1" />
                          View Contract
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My Properties */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Properties</h2>
          <Link
            to="/properties"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Manage Listing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {myProperties.length === 0 ? (
          <div className="border-2 p-6 rounded-lg text-sm text-muted-foreground">
            No properties yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProperties.slice(0, 3).map((property) => (
              <div key={property.id} className="bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-muted overflow-hidden">
                    <img
                      src={property.photos?.[0] || propertyImage}
                      alt={property.title || 'Property'}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
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
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">{property.title || 'Property'}</h3>
                    <StatusBadge status={verificationStatus(property)} />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property.city && property.state
                        ? `${property.city}, ${property.state}`
                        : property.location || 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{property.bedrooms || 0} bed</span>
                    <span>{property.bathrooms || 0} bath</span>
                    <span>{property.size || 0} sqft</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xl font-bold text-accent">
                        RM {property.price?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/listing/${property.id}`);
                        }}
                        className="p-2 border rounded-md hover:bg-muted transition"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {property.status === 'verified' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/properties/${property.id}/edit`);
                          }}
                          className="p-2 border rounded-md hover:bg-muted transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(property.id);
                        }}
                        className="p-2 border rounded-md hover:bg-muted transition text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Property</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this property? This action cannot be undone.
              Any active applications or contracts will also be affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-md hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-white rounded-md hover:opacity-90 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}

