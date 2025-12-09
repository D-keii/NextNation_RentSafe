import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockProperties, mockContracts, mockEscrows } from '@/data/mockData';
import { Contract } from '@/types';
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
  UploadCloud,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ContractFilter = 'all' | 'pending' | 'active' | 'completed';

export default function Contracts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'sign' | 'approve_photos' | 'reject_photos' | 'upload_photos' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContractFilter>('all');

  const isLandlord = user?.role === 'landlord';

  // Filter contracts based on role
  const allContracts = useMemo(() => {
    return isLandlord
      ? mockContracts.filter((c) => {
          if (!user?.ic) {
            return c.landlordIc === '800515-01-5678';
          }
          return c.landlordIc === user.ic || c.landlordIc === '800515-01-5678';
        })
      : mockContracts.filter((c) => {
          if (!user?.ic) {
            return c.tenantIc === '950101-01-1234';
          }
          return c.tenantIc === user.ic;
        });
  }, [isLandlord, user?.ic]);

  // Categorize contracts into Pending, Active, Completed
  const categorizeContract = (contract: Contract): ContractFilter => {
    const escrow = mockEscrows.find((e) => e.contractId === contract.id);
    const today = new Date();
    const endDate = new Date(contract.endDate);

    // Completed: contract status is completed OR (endDate passed AND escrow is released/release_requested)
    if (
      contract.status === 'completed' ||
      (endDate < today && (escrow?.status === 'released' || escrow?.status === 'release_requested'))
    ) {
      return 'completed';
    }

    // Active: contract status is active AND escrow status is secured
    if (contract.status === 'active' && escrow?.status === 'secured') {
      return 'active';
    }

    // Pending: everything else (pending_photos, pending_tenant_approval, pending_signatures, fully_signed with pending escrow)
    return 'pending';
  };

  const categorizedContracts = useMemo(() => {
    return allContracts.map((contract) => ({
      contract,
      category: categorizeContract(contract),
      escrow: mockEscrows.find((e) => e.contractId === contract.id),
    }));
  }, [allContracts]);

  const statusCounts = useMemo(() => {
    const all = categorizedContracts.length;
    const pending = categorizedContracts.filter((c) => c.category === 'pending').length;
    const active = categorizedContracts.filter((c) => c.category === 'active').length;
    const completed = categorizedContracts.filter((c) => c.category === 'completed').length;
    return { all, pending, active, completed };
  }, [categorizedContracts]);

  const filteredContracts = useMemo(() => {
    if (statusFilter === 'all') {
      return categorizedContracts;
    }
    return categorizedContracts.filter((c) => c.category === statusFilter);
  }, [categorizedContracts, statusFilter]);


  const handleAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    if (actionType === 'sign') {
      toast.success('Contract signed successfully!', {
        description: 'Your digital signature has been embedded.',
      });
    } else if (actionType === 'approve_photos') {
      toast.success('Photos approved!', {
        description: 'You can now proceed to sign the contract.',
      });
    } else if (actionType === 'reject_photos') {
      toast.info('Photos rejected', {
        description: 'The landlord will be notified to re-upload photos.',
      });
    } else if (actionType === 'upload_photos') {
      toast.success('Photos uploaded (mock)', {
        description: 'Tenant will be prompted to approve the inspection photos.',
      });
    }
    
    setSelectedContract(null);
    setActionType(null);
  };

  const getContractStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_photos: 'Waiting for Photos',
      pending_tenant_approval: 'Photos Pending Approval',
      pending_signatures: 'Awaiting Signatures',
      fully_signed: 'Fully Signed',
      active: 'Active',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Contracts
          </h1>
          <p className="text-muted-foreground">
            View and manage your rental contracts
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b">
          {(['all', 'pending', 'active', 'completed'] as ContractFilter[]).map((filter) => {
            const label =
              filter === 'all'
                ? 'All'
                : filter === 'pending'
                ? 'Pending'
                : filter === 'active'
                ? 'Active'
                : 'Completed';

            const count = statusCounts[filter];
            const isActive = statusFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
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
              <p className="text-muted-foreground text-center max-w-sm">
                {statusFilter === 'all' && 'Contracts will appear here once an application is approved.'}
                {statusFilter === 'pending' && 'Contracts in progress will appear here.'}
                {statusFilter === 'active' && 'Active tenancy contracts will appear here.'}
                {statusFilter === 'completed' && 'Completed contracts will appear here.'}
              </p>
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
                        <img
                          src={property?.photos[0] || '/placeholder.svg'}
                          alt={property?.title}
                          className="h-full w-full object-cover"
                        />
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
                            <p className="text-sm text-muted-foreground">
                              Tenant IC: {contract.tenantIc}
                            </p>
                            <p className="text-sm font-medium text-accent">
                              RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Landlord IC: {contract.landlordIc}
                            </p>
                            <p className="text-sm font-medium text-accent">
                              RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {/* Show actions based on contract status, regardless of filter */}
                      {/* Always show View Contract button */}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                        <FileText className="h-4 w-4 mr-1" />
                        View Contract
                      </Button>
                      
                      {/* Pending Photos: Landlord can upload */}
                      {contract.status === 'pending_photos' && isLandlord && (
                        <Button variant="accent" size="sm" onClick={() => navigate(`/contracts/${contract.id}/upload-photos`)}>
                          <Image className="h-4 w-4 mr-1" />
                          Upload Photos
                        </Button>
                      )}
                      
                      {/* Pending Tenant Approval: Tenant can approve/reject */}
                      {contract.status === 'pending_tenant_approval' && !isLandlord && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract.id);
                              setActionType('reject_photos');
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject Photos
                          </Button>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract.id);
                              setActionType('approve_photos');
                            }}
                          >
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

        {/* Action Dialog */}
        <Dialog open={!!selectedContract} onOpenChange={() => {
          setSelectedContract(null);
          setActionType(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === 'sign' && (
                  <>
                    <Shield className="h-5 w-5 text-primary" />
                    Sign Contract with MyDigital ID
                  </>
                )}
                {actionType === 'approve_photos' && (
                  <>
                    <Check className="h-5 w-5 text-success" />
                    Approve Property Photos
                  </>
                )}
                {actionType === 'reject_photos' && (
                  <>
                    <X className="h-5 w-5 text-destructive" />
                    Reject Property Photos
                  </>
                )}
                {actionType === 'upload_photos' && (
                  <>
                    <Image className="h-5 w-5 text-accent" />
                    Upload Inspection Photos
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'sign' && (
                  'Your digital signature will be embedded with your name, IC number, timestamp, and document hash.'
                )}
                {actionType === 'approve_photos' && (
                  'By approving, you confirm that the property photos accurately represent the rental unit.'
                )}
                {actionType === 'reject_photos' && (
                  'The landlord will be notified to upload new photos. Please provide a reason for rejection.'
                )}
                {actionType === 'upload_photos' && (
                  'Attach move-in photos for tenant approval. This is a mock upload — files stay on your device.'
                )}
              </DialogDescription>
            </DialogHeader>

            {actionType === 'upload_photos' && (
              <div className="rounded-lg border-2 border-dashed p-4 space-y-2 text-sm text-muted-foreground">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p>Drag files here or click confirm to simulate an upload.</p>
                <p className="text-xs">Tenants will be prompted to approve before signing.</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSelectedContract(null);
                setActionType(null);
              }}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'reject_photos' ? 'destructive' : 'accent'}
                onClick={handleAction}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
