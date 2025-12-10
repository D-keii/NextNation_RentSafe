import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import { mockProperties, mockContracts } from './data/mockData.js';
import { ArrowLeft, Upload, Image as ImageIcon, Trash2, Building2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from './Components/ToastContext.jsx';

export default function UploadPhotos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const contract = mockContracts.find((c) => c.id === id);
  const property = mockProperties.find((p) => p.id === contract?.propertyId);

  if (!contract || !property) {
    return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Contract Not Found</h3>
            <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
          </CardContent>
        </Card>
    );
  }

  const handleFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const previews = list.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...previews]);
    toast({ title: `${list.length} photo(s) added`, variant: 'info' });
  };

  const handleUpload = async () => {
    if (photos.length < 5) {
      toast({
        title: 'More photos required',
        description: 'Please upload at least 5 photos before uploading.',
        variant: 'error',
      });
      return;
    }
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsUploading(false);
    toast({ title: 'Photos uploaded', description: 'Tenant will be notified to review.', variant: 'success' });
    navigate('/contracts');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/contracts')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Upload Inspection Photos
          </h1>
          <p className="text-muted-foreground">Upload move-in photos for tenant approval</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                <img src={property.photos[0] || '/placeholder.svg'} alt={property.title} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {property.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified'}
                </p>
                <p className="text-sm text-muted-foreground">Contract ID: {contract.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Photos</CardTitle>
            <CardDescription>
              Upload at least 5 photos showing the property's condition at move-in. The tenant must approve these before signing the
              contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files || [])}
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
                handleFiles(e.dataTransfer.files);
              }}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click or drag photos here to upload</p>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={photo + index} className="relative group rounded-lg overflow-hidden bg-muted">
                    <img src={photo} alt={`Inspection ${index + 1}`} className="h-32 w-full object-cover" />
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
            {photos.length < 5 && <p className="text-xs text-destructive">Add at least {5 - photos.length} more photo(s) to save.</p>}

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => navigate('/contracts')}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleUpload} disabled={isUploading || photos.length < 5}>
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

