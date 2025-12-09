import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties } from '@/data/mockData';
import { Property } from '@/types';
import { ArrowLeft, Building2, Upload, Plus, Trash2, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const amenitiesList = [
  'WiFi',
  'Air Conditioning',
  'Swimming Pool',
  'Gym',
  'Security',
  'Parking',
  'Garden',
  'Playground',
  'Near Schools',
  'Washing Machine',
  'Smart Home',
  'Concierge',
];

export default function AddProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(id);
  const existingProperty = mockProperties.find((p) => p.id === id);
  const isEditable = !isEditMode || !existingProperty || existingProperty.status === 'verified';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    postcode: '',
    city: '',
    state: '',
    housingType: '' as '' | 'condo' | 'apartment' | 'studio' | 'house',
    price: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    amenities: [] as string[],
  });
  const [photos, setPhotos] = useState<string[]>(existingProperty?.photos || []);
  const malaysianStates = [
    'Kuala Lumpur',
    'Selangor',
    'Johor',
    'Penang',
    'Perak',
    'Pahang',
    'Negeri Sembilan',
    'Melaka',
    'Kelantan',
    'Terengganu',
    'Kedah',
    'Perlis',
    'Sabah',
    'Sarawak',
    'Putrajaya',
    'Labuan',
  ];

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        title: existingProperty.title,
        description: existingProperty.description,
        address: existingProperty.address,
        postcode: existingProperty.postcode || '',
        city: existingProperty.city || '',
        state: existingProperty.state || '',
        housingType: existingProperty.housingType || '',
        price: existingProperty.price.toString(),
        bedrooms: existingProperty.bedrooms.toString(),
        bathrooms: existingProperty.bathrooms.toString(),
        size: existingProperty.size.toString(),
        amenities: existingProperty.amenities,
      });
      setPhotos(existingProperty.photos);
    }
  }, [existingProperty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      toast.error('Complete ownership verification before editing details.');
      return;
    }
    if (photos.length < 3) {
      toast.error('Please add at least 3 photos before saving.');
      return;
    }
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const propertyId = existingProperty?.id ?? `prop-${mockProperties.length + 1}`;
    
    // Create property data to pass through
    const propertyData: Partial<Property> = {
      id: propertyId,
      title: formData.title,
      description: formData.description,
      address: formData.address,
      postcode: formData.postcode,
      city: formData.city,
      state: formData.state,
      housingType: formData.housingType || undefined,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      size: parseFloat(formData.size),
      amenities: formData.amenities,
      photos: photos,
      available: true,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'unverified',
      verification: {
        status: 'pending',
      },
    };

    toast.success(`Property details saved`, {
      description: 'Continue to upload ownership documents for verification.',
    });
    
    navigate(`/properties/${propertyId}/verification`, {
      state: { 
        fromAddProperty: true, 
        propertyId,
        propertyData, // Pass the property data so verification page has it
      },
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Step Indicator - only show for new properties */}
        {!isEditMode && (
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Property Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Ownership Verification</span>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {isEditMode ? 'Edit Property Details' : 'Add New Property — Step 1'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update your property listing details.'
              : 'Provide property details and photos. You\'ll continue with ownership verification in the next step.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Provide accurate information to attract quality tenants.
              </CardDescription>
            </CardHeader>
          <CardContent>
            {!isEditable && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Ownership verification required</p>
                  <p className="text-amber-800">
                    Editing is locked until this property is verified. Continue ownership verification to proceed.
                  </p>
                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="accent"
                      onClick={() => navigate(`/properties/${existingProperty?.id ?? id}/verification`)}
                    >
                      Continue Ownership Verification
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <fieldset disabled={!isEditable} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern Studio Apartment in KLCC"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property, its features, and nearby amenities..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="Unit number, building name, street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              {/* City / State / Housing Type */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City / Town</Label>
                  <Input
                    id="city"
                    placeholder="Enter city or town"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {malaysianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="housingType">Housing Type</Label>
                  <Select
                    value={formData.housingType}
                    onValueChange={(value) => setFormData({ ...formData, housingType: value as 'condo' | 'apartment' | 'studio' | 'house' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price and Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (RM)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sq ft)</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="850"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    placeholder="2"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Property Photos
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
                    setPhotos((prev) => [...prev, ...previews]);
                    toast.success(`${files.length} photo(s) added.`);
                  }}
                />
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropped = e.dataTransfer.files;
                    if (!dropped || dropped.length === 0) return;
                    const previews = Array.from(dropped).map((file) => URL.createObjectURL(file));
                    setPhotos((prev) => [...prev, ...previews]);
                    toast.success(`${dropped.length} photo(s) ready to upload (mock).`);
                  }}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click or drag photos here to upload
                  </p>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={photo + index} className="relative group rounded-lg overflow-hidden bg-muted">
                        <img src={photo} alt={`Property ${index + 1}`} className="h-32 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-card/90 border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < 3 && (
                  <p className="text-xs text-destructive">
                    Add at least {3 - photos.length} more photo(s) to save.
                  </p>
                )}
              </div>

            </fieldset>

            {/* Submit */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting || photos.length < 3 || !isEditable}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
