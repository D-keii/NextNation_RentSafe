import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties, mockContracts } from '@/data/mockData';
import { History, Building2, Calendar, DollarSign, FileText } from 'lucide-react';

export default function RentalHistory() {
  // Mock completed contracts for history
  const completedContracts = mockContracts.filter((c) => c.status === 'completed' || c.status === 'active');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Rental History
          </h1>
          <p className="text-muted-foreground">
            View your past and current rentals
          </p>
        </div>

        {completedContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Rental History</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Your past rentals will appear here once contracts are completed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completedContracts.map((contract) => {
              const property = mockProperties.find((p) => p.id === contract.propertyId);
              
              return (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <StatusBadge status={contract.status} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {property?.city && property?.state 
                                ? `${property.city}, ${property.state}`
                                : 'Location not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              RM {contract.monthlyRent.toLocaleString()}/mo
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
