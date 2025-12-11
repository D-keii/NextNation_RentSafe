import { useEffect, useMemo, useState, useContext } from 'react';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import { Wallet, Shield, CreditCard, Smartphone, ArrowRight, Check, Calendar, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './Components/ui/dialog.jsx';
import { useToast } from './Components/ToastContext.jsx';
import api from './axios.js';
import { UserContext } from './Context/UserContext.jsx';

export default function Escrow() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const { userProfile } = useContext(UserContext);
  const user = userProfile || {};
  const isLandlord = user?.role === 'landlord';
  const { toast } = useToast();
  const [escrowsData, setEscrowsData] = useState([]);
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
        const contracts = [...(dashboard?.activeContracts || []), ...(dashboard?.pendingContracts || [])];
        const escrows = await Promise.all(
          contracts.map(async (contract) => {
            try {
              const { data: escrow } = await api.get(`/escrow/${contract.id}`);
              return { escrow, contract };
            } catch {
              return null;
            }
          })
        );
        const filtered = escrows.filter(Boolean).map(({ escrow, contract }) => ({
          ...escrow,
          contract,
          property: contract.property,
        }));
        if (isMounted) setEscrowsData(filtered);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load escrows');
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

  const escrows = useMemo(
    () => escrowsData.filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter)),
    [escrowsData, statusFilter]
  );

  const statusCounts = {
    all: escrowsData.length,
    pending: escrowsData.filter((e) => e.status === 'pending').length,
    secured: escrowsData.filter((e) => e.status === 'secured').length,
    release_requested: escrowsData.filter((e) => e.status === 'release_requested').length,
    released: escrowsData.filter((e) => e.status === 'released').length,
    disputed: escrowsData.filter((e) => e.status === 'disputed').length,
  };

  const handleReleaseRequest = async (action, escrowId) => {
    setIsLoading(true);
    try {
      if (action === 'approve') {
        await api.post(`/escrow/${escrowId}/approve-release`);
      } else if (action === 'reject') {
        await api.post(`/escrow/${escrowId}/reject-release`);
      } else {
        await api.post(`/escrow/${escrowId}/request-release`);
      }
      toast({
        title:
          action === 'approve' ? 'Deposit released' : action === 'reject' ? 'Request rejected' : 'Release requested',
        variant: action === 'approve' ? 'success' : action === 'reject' ? 'warning' : 'info',
      });
      // refresh list
      const { data: dashboard } = await api.get(`/users/${user.ic}/landlord-dashboard`);
      const contracts = [...(dashboard?.activeContracts || []), ...(dashboard?.pendingContracts || [])];
      const refreshed = await Promise.all(
        contracts.map(async (contract) => {
          try {
            const { data: escrow } = await api.get(`/escrow/${contract.id}`);
            return { ...escrow, contract, property: contract.property };
          } catch {
            return null;
          }
        })
      );
      setEscrowsData(refreshed.filter(Boolean));
    } catch (err) {
      console.error(err);
      toast({ title: 'Action failed', description: 'Please try again.', variant: 'error' });
    } finally {
      setIsLoading(false);
      setShowReleaseDialog(false);
    }
  };

  const handlePayment = async () => {
    toast({
      title: 'Payment flow not available',
      description: 'Deposit payment is handled outside this mock UI.',
      variant: 'info',
    });
    setShowPaymentDialog(false);
    setPaymentMethod(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Loading escrow records...</p>
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
            <Wallet className="h-6 w-6" />
            Escrow Management
          </h1>
          <p className="text-muted-foreground">
            {isLandlord ? 'View and manage tenant deposits' : 'View your deposit status and request releases'}
          </p>
        </div>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-success">Secure Escrow Protection</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All deposits are held securely and can only be released when both parties agree or through the dispute resolution
                  process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 border-b">
          {['all', 'pending', 'secured', 'release_requested', 'released', 'disputed'].map((status) => {
            const label =
              status === 'all'
                ? 'All'
                : status
                    .split('_')
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(' ');
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

        {escrows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Escrow Records</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {escrows.map((escrow) => {
              const contract = escrow.contract;
              const property = escrow.property || contract?.property;
              return (
                <Card key={escrow.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img src={property?.photos?.[0] || '/placeholder.svg'} alt={property?.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <StatusBadge status={escrow.status} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {property?.city && property?.state ? `${property.city}, ${property.state}` : 'Location not specified'}
                            </span>
                            {escrow.paidAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Paid: {new Date(escrow.paidAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-accent">RM {escrow.amount.toLocaleString()}</span>
                            {escrow.paymentMethod && (
                              <span className="text-sm text-muted-foreground uppercase">via {escrow.paymentMethod}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:items-end">
                        {escrow.status === 'pending' && !isLandlord && (
                          <Button variant="accent" onClick={() => setShowPaymentDialog(true)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Deposit
                          </Button>
                        )}
                        {escrow.status === 'secured' && !isLandlord && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReleaseDialog(true);
                            }}
                          >
                            Request Release
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                        {escrow.status === 'release_requested' && isLandlord && (
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleReleaseRequest('reject')}>
                              Dispute
                            </Button>
                            <Button variant="accent" onClick={() => handleReleaseRequest('approve')}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve Release
                            </Button>
                          </div>
                        )}
                        {escrow.status === 'released' && (
                          <p className="text-sm text-muted-foreground">
                            Released on {escrow.releasedAt ? new Date(escrow.releasedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pay Deposit
              </DialogTitle>
              <DialogDescription>Choose your preferred payment method to secure your deposit in escrow.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <button
                onClick={() => setPaymentMethod('fpx')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  paymentMethod === 'fpx' ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-medium">FPX Online Banking</p>
                  <p className="text-sm text-muted-foreground">Pay directly from your bank</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('duitnow')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  paymentMethod === 'duitnow' ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-medium">DuitNow QR</p>
                  <p className="text-sm text-muted-foreground">Scan and pay with your banking app</p>
                </div>
              </button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handlePayment} disabled={!paymentMethod || isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showReleaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Deposit Release</DialogTitle>
              <DialogDescription>
                By requesting a release, you confirm that the tenancy has ended and you've returned the property in good condition.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => handleReleaseRequest('request')} disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}

