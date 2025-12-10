import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './Components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './Components/ui/card.jsx';
import Badge from './Components/ui/badge.jsx';
import Separator from './Components/ui/separator.jsx';
import { mockProperties } from './data/mockData.js';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ArrowLeft,
  User,
  Shield,
  Check,
} from 'lucide-react';
import { useToast } from './Components/ToastContext.jsx';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const user = { role: 'tenant' }; // mock role

  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <h1 className="text-2xl font-bold">Property Not Found</h1>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
    );
  }

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsApplying(false);
    toast({
      title: 'Application submitted',
      description: 'The landlord will review your application.',
      variant: 'success',
    });
    navigate('/applications');
  };

  const handleSave = () => {
    setIsSaved((prev) => !prev);
    toast({
      title: isSaved ? 'Removed from saved' : 'Added to saved listings',
      variant: 'info',
    });
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={property.photos?.[selectedImageIndex] || property.photos?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" onClick={handleSave} className="bg-card/90 backdrop-blur-sm">
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-card/90 backdrop-blur-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: 'Link copied', variant: 'info' });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {property.photos && property.photos.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {property.photos.map((photo, index) => (
                    <button
                      key={photo + index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all shadow-md hover:scale-105 ${
                        selectedImageIndex === index ? 'border-accent ring-2 ring-accent/50' : 'border-transparent hover:border-accent/50'
                      }`}
                    >
                      <img src={photo || '/placeholder.svg'} alt={`${property.title}-${index}`} className="h-full w-full object-cover" />
                      {selectedImageIndex === index && <div className="absolute inset-0 bg-accent/10" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-accent">RM {property.price.toLocaleString()}</p>
                  <p className="text-muted-foreground">per month</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-muted p-2">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{property.bedrooms}</p>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-muted p-2">
                    <Bath className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{property.bathrooms}</p>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-muted p-2">
                    <Square className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{property.size}</p>
                    <p className="text-sm text-muted-foreground">Sq. Ft.</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-lg font-semibold mb-3">About this property</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity} className="gap-1">
                      <Check className="h-3 w-3" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Landlord
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-foreground">
                      {property.landlordName?.charAt(0) || 'L'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{property.landlordName || 'Landlord'}</p>
                    <div className="flex items-center text-sm text-success">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified with MyDigital ID
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Contact information will be available after your application is approved.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-success">RentSafe Protection</p>
                    <p className="text-muted-foreground mt-1">
                      Your deposit will be held in escrow and only released according to contract terms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

