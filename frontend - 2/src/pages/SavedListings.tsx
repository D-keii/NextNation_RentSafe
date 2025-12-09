import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties } from '@/data/mockData';
import { Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SavedListings() {
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<string[]>(['prop-1', 'prop-2']);

  const savedProperties = mockProperties.filter((p) => savedIds.includes(p.id));

  const handleSave = (propertyId: string) => {
    setSavedIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6" />
            Saved Listings
          </h1>
          <p className="text-muted-foreground">
            Properties you've saved for later
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Saved Listings</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                Save properties you're interested in to view them here.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                <Search className="h-4 w-4 mr-2" />
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property, index) => (
              <div
                key={property.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard
                  property={property}
                  isSaved={savedIds.includes(property.id)}
                  onSave={handleSave}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
