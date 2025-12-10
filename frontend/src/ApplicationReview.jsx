import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import StatusBadge from './Components/StatusBadge.jsx';
import { mockProperties, mockApplications, mockTenantInfo, mockRentalHistories } from './data/mockData.js';
import { ArrowLeft, User, Building2, Calendar, DollarSign, Check, X, FileText, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useToast } from './Components/ToastContext.jsx';

export default function ApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const application = mockApplications.find((app) => app.id === id);
  const property = mockProperties.find((p) => p.id === application?.propertyId);
  const tenantInfo = application ? mockTenantInfo[application.tenantIc] : null;
  const rentalHistory = application ? mockRentalHistories[application.tenantIc] || [] : [];

  if (!application || !property) {
    return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Application Not Found</h3>
            <Button onClick={() => navigate('/applications')}>Back to Applications</Button>
          </CardContent>
        </Card>
    );
  }

  const handleDecision = async (action) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsProcessing(false);
    toast({
      title: `Application ${action}`,
      description: 'Notification sent to tenant.',
      variant: action === 'approved' ? 'success' : 'info',
    });
    navigate('/applications/list');
  };

  return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/applications/list')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Review Tenant Application
          </h1>
          <p className="text-muted-foreground">Review tenant details and property information</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Application Status</p>
                <StatusBadge status={application.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-semibold flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tenant Information
            </CardTitle>
            <CardDescription>Verified information from MyDigital ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-semibold">{application.tenantName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IC Number</p>
                <p className="font-semibold">{application.tenantIc}</p>
              </div>
              {tenantInfo && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">{tenantInfo.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold capitalize">{tenantInfo.gender}</p>
                  </div>
                </>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Rental History</p>
              {rentalHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous rental history available in system.</p>
              ) : (
                <div className="space-y-3">
                  {rentalHistory.map((history) => (
                    <div key={history.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{history.propertyTitle}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {history.propertyLocation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>
                          <span>Landlord: </span>
                          <span className="font-medium">{history.landlordName}</span>
                        </div>
                        <div>
                          <span>Period: </span>
                          <span className="font-medium">
                            {new Date(history.startDate).toLocaleDateString()} - {new Date(history.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                <img src={property.photos[0] || '/placeholder.svg'} alt={property.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    RM {property.price.toLocaleString()}/month
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {application.status === 'pending' && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => handleDecision('rejected')} disabled={isProcessing} className="text-destructive">
                  <X className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
                <Button variant="accent" onClick={() => handleDecision('approved')} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Approve Application
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

