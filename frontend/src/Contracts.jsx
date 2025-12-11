import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import api from './axios.js';
import {
  FileText,
  Check,
  X,
  Shield,
  Calendar,
  DollarSign,
  Building2,
  PenTool,
  Image,
  Upload as UploadIcon,
} from 'lucide-react';
import { UserContext } from './Context/UserContext.jsx';

const filters = ['all', 'pending', 'active', 'completed'];

export default function Contracts() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const { userProfile } = useContext(UserContext);
  const user = userProfile || {};
  const isLandlord = user?.role === 'landlord';
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: dashboard } = await api.get(`/users/${user.ic}/landlord-dashboard`);
        if (!isMounted) return;
        const merged = [...(dashboard?.activeContracts || []), ...(dashboard?.pendingContracts || [])];
        const deduped = Object.values(
          merged.reduce((acc, c) => {
            acc[c.id] = c;
            return acc;
          }, {})
        );
        const withEscrow = await Promise.all(
          deduped.map(async (contract) => {
            try {
              const { data: escrow } = await api.get(`/escrow/${contract.id}`);
              return { contract, escrow };
            } catch {
              return { contract, escrow: null };
            }
          })
        );
        if (isMounted) setContracts(withEscrow);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load contracts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isLandlord && user.ic) {
      load();
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [user.ic, isLandlord]);

  const categorizeContract = (contract) => {
    const escrow = contracts.find((e) => e.contract.id === contract.id)?.escrow;
    const today = new Date();
    const endDate = new Date(contract.endDate);
    if (contract.status === 'completed' || (endDate < today && (escrow?.status === 'released' || escrow?.status === 'release_requested'))) {
      return 'completed';
    }
    if (contract.status === 'active' && escrow?.status === 'secured') {
      return 'active';
    }
    return 'pending';
  };

  const categorizedContracts = useMemo(
    () =>
      contracts.map(({ contract, escrow }) => ({
        contract,
        category: categorizeContract(contract),
        escrow,
      })),
    [contracts]
  );

  const statusCounts = useMemo(() => {
    const all = categorizedContracts.length;
    const pending = categorizedContracts.filter((c) => c.category === 'pending').length;
    const active = categorizedContracts.filter((c) => c.category === 'active').length;
    const completed = categorizedContracts.filter((c) => c.category === 'completed').length;
    return { all, pending, active, completed };
  }, [categorizedContracts]);

  const filteredContracts = useMemo(() => {
    if (statusFilter === 'all') return categorizedContracts;
    return categorizedContracts.filter((c) => c.category === statusFilter);
  }, [categorizedContracts, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Loading contracts...</p>
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
            <FileText className="h-6 w-6" />
            Contracts
          </h1>
          <p className="text-muted-foreground">View and manage your rental contracts</p>
        </div>

        <div className="flex items-center gap-2 border-b">
          {filters.map((filter) => {
            const label = filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1);
            const count = statusCounts[filter];
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {statusFilter === 'all' && 'No Contracts Yet'}
                {statusFilter === 'pending' && 'No Pending Contracts'}
                {statusFilter === 'active' && 'No Active Contracts'}
                {statusFilter === 'completed' && 'No Completed Contracts'}
              </h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredContracts.map(({ contract, escrow }) => {
              const property = contract.property;
              return (
                <Card key={contract.id}>
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img src={property?.photos?.[0] || '/placeholder.svg'} alt={property?.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{property?.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Contract:</span>
                          <StatusBadge status={contract.status} />
                          {escrow && (
                            <>
                              <span className="text-sm text-muted-foreground">Escrow:</span>
                              <StatusBadge status={escrow.status} />
                            </>
                          )}
                        </div>
                        {isLandlord ? (
                          <>
                            <p className="text-sm text-muted-foreground">Tenant IC: {contract.tenantIc}</p>
                            <p className="text-sm font-medium text-accent">
                              RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">Landlord IC: {contract.landlordIc}</p>
                            <p className="text-sm font-medium text-accent">
                              RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {(contract.status === 'pending_signatures' || 
                        contract.status === 'pending_photos' || 
                        contract.status === 'pending_tenant_approval' ||
                        contract.status === 'active' ||
                        contract.status === 'fully_signed') && (
                        <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View Contract
                        </Button>
                      )}
                      {contract.status === 'pending_photos' && isLandlord && (
                        <Button variant="accent" size="sm" onClick={() => navigate(`/contracts/${contract.id}/upload-photos`)}>
                          <Image className="h-4 w-4 mr-1" />
                          Upload Photos
                        </Button>
                      )}
                      {contract.status === 'pending_tenant_approval' && !isLandlord && (
                        <>
                          <Button variant="outline" size="sm">
                            <X className="h-4 w-4 mr-1" />
                            Reject Photos
                          </Button>
                          <Button variant="accent" size="sm">
                            <Check className="h-4 w-4 mr-1" />
                            Approve Photos
                          </Button>
                        </>
                      )}
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

