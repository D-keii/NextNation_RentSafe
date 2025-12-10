import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import { mockProperties, mockContracts, mockEscrows } from './data/mockData.js';
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

const filters = ['all', 'pending', 'active', 'completed'];

export default function Contracts() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const user = { role: 'landlord', ic: '800515-01-5678' };
  const isLandlord = user?.role === 'landlord';

  const allContracts = useMemo(() => {
    return isLandlord
      ? mockContracts.filter((c) => c.landlordIc === '800515-01-5678')
      : mockContracts.filter((c) => c.tenantIc === user?.ic);
  }, [isLandlord, user?.ic]);

  const categorizeContract = (contract) => {
    const escrow = mockEscrows.find((e) => e.contractId === contract.id);
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
      allContracts.map((contract) => ({
        contract,
        category: categorizeContract(contract),
        escrow: mockEscrows.find((e) => e.contractId === contract.id),
      })),
    [allContracts]
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
              const property = mockProperties.find((p) => p.id === contract.propertyId);
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

