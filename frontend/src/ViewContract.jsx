import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import { Badge } from './Components/ui/badge.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import { mockProperties, mockContracts } from './data/mockData.js';
import { FileText, Shield, ArrowLeft, Check, X, Building2, Calendar, DollarSign, PenTool, Image } from 'lucide-react';
import { useState } from 'react';
import { useToast } from './Components/ToastContext.jsx';

export default function ViewContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();

  const contract = mockContracts.find((c) => c.id === id);
  const property = mockProperties.find((p) => p.id === contract?.propertyId);
  const user = { role: 'landlord', ic: '800515-01-5678' };
  const isLandlord = user?.role === 'landlord';

  if (!contract || !property) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Contract Not Found</h3>
            <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Determine if user can sign based on contract status and user role
  // For pending_signatures: both can sign (tenant first, then landlord)
  // For pending_tenant_approval: tenant can sign after approving photos
  const canSign = 
    contract.photosApproved && 
    ((isLandlord && contract.tenantSigned && !contract.landlordSigned && contract.status === 'pending_signatures') || 
     (!isLandlord && !contract.tenantSigned && (contract.status === 'pending_signatures' || contract.status === 'pending_tenant_approval')));

  const handleSign = async () => {
    setIsSigning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSigning(false);
    toast({
      title: 'Contract signed successfully!',
      description: 'Your digital signature has been embedded with MyDigital ID.',
      variant: 'success',
    });
    navigate('/contracts');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/contracts')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Rental Agreement Contract
          </h1>
          <p className="text-muted-foreground">Contract ID: {contract.id}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {property.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenancy Period</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  RM {contract.monthlyRent.toLocaleString()}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Deposit</p>
                <p className="font-semibold">RM {contract.depositAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Signature Status</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <span className="text-sm">Tenant:</span>
                  {contract.tenantSigned ? (
                    <Badge className="text-success bg-white border border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge className="text-muted-foreground bg-white border">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <span className="text-sm">Landlord:</span>
                  {contract.landlordSigned ? (
                    <Badge className="text-success bg-white border border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Signed
                    </Badge>
                  ) : (
                    <Badge className="text-muted-foreground bg-white border">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Photos:</span>
                  {contract.photosApproved ? (
                    <Badge className="text-success bg-white border border-success">
                      <Check className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="text-muted-foreground bg-white border">
                      <X className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
            <CardDescription>Standard tenancy agreement template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. Parties</h3>
                <p className="text-muted-foreground">
                  This agreement is between the Landlord ({contract.landlordIc}) and the Tenant ({contract.tenantIc}).
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">2. Property</h3>
                <p className="text-muted-foreground">
                  The property located at {property.address}
                  {property.city && property.state ? `, ${property.city}, ${property.state}` : ''} shall be rented to the Tenant.
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">3. Term</h3>
                <p className="text-muted-foreground">
                  The tenancy shall commence on {new Date(contract.startDate).toLocaleDateString()} and end on{' '}
                  {new Date(contract.endDate).toLocaleDateString()}.
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">4. Payment & Escrow</h3>
                <p className="text-muted-foreground">
                  Monthly rent of RM {contract.monthlyRent.toLocaleString()} shall be paid on the first day of each month. A security
                  deposit of RM {contract.depositAmount.toLocaleString()} (equivalent to 2 months rent) shall be held in escrow and released
                  according to the terms of this agreement.
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">5. Maintenance</h3>
                <p className="text-muted-foreground">
                  The Tenant is responsible for maintaining the property in good condition. The Landlord is responsible for structural
                  repairs and major maintenance.
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">6. Handover Photos</h3>
                <p className="text-muted-foreground">
                  The Landlord shall upload move-in inspection photos. The Tenant must approve these photos before signing this contract.
                  These photos serve as evidence of the property's condition at the start of tenancy.
                </p>
              </section>
              <section>
                <h3 className="font-semibold mb-2">7. Digital Signatures</h3>
                <p className="text-muted-foreground">
                  This contract uses MyDigital ID for digital signatures. Each signature includes the signer's name, IC number, timestamp,
                  and document hash for legal validity.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {canSign && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Ready to Sign</p>
                  <p className="text-sm text-muted-foreground">
                    {contract.photosApproved
                      ? 'All requirements are met. You can now sign this contract using MyDigital ID.'
                      : 'Please approve the inspection photos before signing.'}
                  </p>
                </div>
                <Button variant="accent" onClick={handleSign} disabled={isSigning}>
                  {isSigning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign via MyDigital ID
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

