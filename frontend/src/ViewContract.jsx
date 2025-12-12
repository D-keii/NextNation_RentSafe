import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import { Badge } from './Components/ui/badge.jsx';
import { FileText, Shield, ArrowLeft, Check, X, Building2, Calendar, CreditCard,DollarSign, PenTool, Image } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { useToast } from './Components/ToastContext.jsx';
import { UserContext } from './Context/UserContext.jsx';
import api from './axios.js';

export default function ViewContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useContext(UserContext);

  const [contract, setContract] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [escrow, setEscrow] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState(null);

  const user = userProfile || {};
  const isLandlord = user?.role === 'landlord';

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/contracts/${id}`);
        if (!isMounted) return;
        setContract(data);
        setProperty(data.property);
        // fetch escrow status for this contract
        try {
          const escrowRes = await api.get(`/escrow/${data.id}`);
          if (isMounted) setEscrow(escrowRes.data);
        } catch (e) {
          console.warn('Failed to fetch escrow status', e);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Contract not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <p className="text-muted-foreground">Loading contract...</p>;
  if (error || !contract || !property) return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{error || 'Contract Not Found'}</h3>
        <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
      </CardContent>
    </Card>
  );

  // Determine actions
  const canSign =
    contract.photosApproved &&
    ((isLandlord && contract.tenantSigned && !contract.landlordSigned && (contract.status === 'pending_signatures' || contract.status === 'tenant_signed_waiting_landlord')) ||
     (!isLandlord && !contract.tenantSigned && (contract.status === 'pending_signatures' || contract.status === 'awaiting_tenant_signature')));

  const canApprovePhotos = !contract.photosApproved && !isLandlord && contract.status === 'pending_tenant_approval';
  const canRejectPhotos = !contract.photosApproved && !isLandlord && contract.status === 'pending_tenant_approval';

  // Handle tenant signing
  const handleSign = async () => {
    setIsSigning(true);
    try {
      const endpoint = isLandlord
        ? `/contracts/${contract.id}/landlord/sign`
        : `/contracts/${contract.id}/tenant/sign`;
      const res = await api.post(endpoint, { name: user.name, ic: user.ic });
      // Prefer returned contract payload, otherwise refetch
      const updated = res?.data?.contract ? res.data.contract : (await api.get(`/contracts/${contract.id}`)).data;
      setContract(updated);
      toast({ title: 'Contract signed successfully!', description: 'Digital signature recorded.', variant: 'success' });
      // If tenant signed, return to contracts list; if landlord signed, keep viewing
      if (!isLandlord) navigate('/contracts');
      // refresh escrow status after possible state changes
      try {
        const escrowRes = await api.get(`/escrow/${contract.id}`);
        setEscrow(escrowRes.data);
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
      toast({ title: 'Signing failed', description: 'Please try again.', variant: 'error' });
    } finally { setIsSigning(false); }
  };

  // Handle tenant photo approval
  const handleApprovePhotos = async () => {
    setIsApproving(true);
    try {
      await api.post(`/contracts/${contract.id}/photos/approve`);
      toast({ title: 'Photos approved', variant: 'success' });
      setContract({ ...contract, photosApproved: true, status: 'awaiting_tenant_signature' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Approval failed', variant: 'error' });
    } finally { setIsApproving(false); }
  };

  // Handle tenant photo rejection
  const handleRejectPhotos = async () => {
    setIsApproving(true);
    try {
      await api.post(`/contracts/${contract.id}/photos/reject`);
      toast({ title: 'Photos rejected', variant: 'destructive' });
      setContract({ ...contract, photosApproved: false, status: 'photos_rejected_by_tenant' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Rejection failed', variant: 'error' });
    } finally { setIsApproving(false); }
  };

  // Handle make payment (tenant)
  const handleMakePayment = async () => {
    setIsPaying(true);
    try {
      const payload = { contract_id: contract.id, amount: contract.depositAmount };
      const res = await api.post('/escrow/create', payload);
      setEscrow(res.data.escrow);
      // update contract locally to reflect deposit_paid state
      setContract({ ...contract, status: 'deposit_paid' });
      toast({ title: 'Payment recorded', description: 'Deposit created', variant: 'success' });
      navigate('/tenant-escrow', { state: { highlightContractId: contract.id } });
    } catch (err) {
      console.error(err);
      toast({ title: 'Payment failed', description: 'Please try again.', variant: 'error' });
    } finally { setIsPaying(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/contracts')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Contracts
      </Button>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" /> Rental Agreement Contract
        </h1>
        <p className="text-muted-foreground">Contract ID: {contract.id}</p>
      </div>

      {/* Contract Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" />{property.title}</p>
              <p className="text-sm text-muted-foreground">{property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenancy Period</p>
              <p className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" />RM {contract.monthlyRent.toLocaleString()}/month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Deposit</p>
              <p className="font-semibold">RM {contract.depositAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Signatures & Photos */}
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Signature Status</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4" /> <span className="text-sm">Tenant:</span>
                {contract.tenantSigned ? (
                  <Badge className="text-success bg-white border border-success"><Check className="h-3 w-3 mr-1" />Signed</Badge>
                ) : (
                  <Badge className="text-muted-foreground bg-white border"><X className="h-3 w-3 mr-1" />Pending</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4" /> <span className="text-sm">Landlord:</span>
                {contract.landlordSigned ? (
                  <Badge className="text-success bg-white border border-success"><Check className="h-3 w-3 mr-1" />Signed</Badge>
                ) : (
                  <Badge className="text-muted-foreground bg-white border"><X className="h-3 w-3 mr-1" />Pending</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" /> <span className="text-sm">Photos:</span>
                {contract.photosApproved ? (
                  <Badge className="text-success bg-white border border-success"><Check className="h-3 w-3 mr-1" />Approved</Badge>
                ) : (
                  <Badge className="text-muted-foreground bg-white border"><X className="h-3 w-3 mr-1" />Pending</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Approval Buttons (Tenant) */}
      {canApprovePhotos && (
        <Card className="border-yellow-400 bg-yellow-50">
          <CardContent className="flex justify-end gap-2">
            <Button variant="success" onClick={handleApprovePhotos} disabled={isApproving}>Approve Photos</Button>
            <Button variant="destructive" onClick={handleRejectPhotos} disabled={isApproving}>Reject Photos</Button>
          </CardContent>
        </Card>
      )}

      {/* Signing */}
      {(canSign || (contract.tenantSigned && contract.landlordSigned)) && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="font-semibold mb-1">{contract.tenantSigned && contract.landlordSigned ? 'Contract Signed' : 'Ready to Sign'}</p>
              <p className="text-sm text-muted-foreground">
                {contract.tenantSigned && contract.landlordSigned
                  ? 'This contract has been signed by both parties.'
                  : (isLandlord && contract.status === 'tenant_signed_waiting_landlord'
                    ? 'Tenant has signed — you can now sign this contract.'
                    : (contract.photosApproved ? 'You can now sign this contract.' : 'Please approve photos first.'))}
              </p>
            </div>
            {/* If both have signed, tenant can make payment when not yet paid; hide CTA for landlord. */}
            {contract.tenantSigned && contract.landlordSigned ? (
              isLandlord ? null : (
                // tenant view: show Make Payment if escrow not yet created/paid (no escrow id)
                (!escrow || !escrow.id) ? (
                  <Button onClick={handleMakePayment} disabled={isPaying}>
                    {isPaying ? 'Processing...' : <><CreditCard className="h-4 w-4 mr-2" />Make Payment</>}
                  </Button>
                ) : null
              )
            ) : (
              <Button onClick={handleSign} disabled={isSigning}>
                {isSigning ? 'Signing...' : <><Shield className="h-4 w-4 mr-2" />Sign via MyDigital ID</>}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
