import { Property } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onSave?: (propertyId: string) => void;
  showActions?: boolean;
}

export function PropertyCard({ property, isSaved = false, onSave, showActions = true }: PropertyCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={property.photos[0] || '/placeholder.svg'}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {showActions && onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(property.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-card/90 p-2 backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              }`}
            />
          </button>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm font-semibold">
            RM {property.price.toLocaleString()}/mo
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 mb-2">{property.title}</h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">
            {property.city && property.state 
              ? `${property.city}, ${property.state}`
              : 'Location not specified'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{property.size} sqft</span>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            className="w-full group/btn"
            onClick={() => navigate(`/listing/${property.id}`)}
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
