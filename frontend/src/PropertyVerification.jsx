import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Components/ui/card.jsx';
import { Button } from './Components/ui/button.jsx';
import { Label } from './Components/ui/label.jsx';
import { ArrowLeft, AlertCircle, Check, FileText, Info, Upload, X } from 'lucide-react';
import { useToast } from './Components/ToastContext.jsx';
import api from './axios.js';

const requiredDocuments = [
  { key: 'spaAgreement', label: 'S&P Agreement (Sale & Purchase Agreement)' },
  { key: 'titleDeed', label: 'Title Deed (Geran / Strata Title)' },
  { key: 'utilityBill', label: 'Utility Bill (TNB or Water)' },
  { key: 'quitRent', label: 'Quit Rent (Cukai Tanah)' },
  { key: 'assessmentTax', label: 'Assessment Tax (Cukai Pintu)' },
];

export default function PropertyVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state || {};
  const propertyFromState = state.propertyId;
  const propertyDataFromState = state.propertyData;
  const [fetchedProperty, setFetchedProperty] = useState(propertyDataFromState);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (propertyDataFromState) return;
      try {
        const { data } = await api.get(`/properties/${id}`);
        if (!isMounted) return;
        setFetchedProperty(data);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Property not found');
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, propertyDataFromState]);

  const property = useMemo(() => fetchedProperty, [fetchedProperty]);

  const [documents, setDocuments] = useState(() =>
    requiredDocuments.reduce((acc, doc) => {
      acc[doc.key] = { file: null, status: 'pending', error: undefined, previewUrl: undefined, progress: 0 };
      return acc;
    }, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRejected = property?.verification?.status === 'rejected';
  const rejectionReason = property?.verification?.rejectionReason;

  const handleDocumentSelect = (key, files) => {
    const file = files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedExtension = /\.(pdf|jpe?g|png)$/i.test(file.name);
    const maxSize = 10 * 1024 * 1024;
    if (!isAllowedType || !isAllowedExtension) {
      setDocuments((prev) => ({
        ...prev,
        [key]: { file: null, status: 'invalid', error: 'Only PDF, JPG, or PNG files are allowed.', progress: 0 },
      }));
      return;
    }
    if (file.size > maxSize) {
      setDocuments((prev) => ({
        ...prev,
        [key]: { file: null, status: 'invalid', error: 'File size must be 10MB or less.', progress: 0 },
      }));
      return;
    }
    const previewUrl = file.type === 'application/pdf' ? undefined : URL.createObjectURL(file);
    setDocuments((prev) => ({
      ...prev,
      [key]: { file, status: 'uploading', error: undefined, previewUrl, progress: 0 },
    }));
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 20, 100);
      setDocuments((prev) => ({
        ...prev,
        [key]: { ...prev[key], progress, status: progress === 100 ? 'uploaded' : 'uploading' },
      }));
      if (progress === 100) clearInterval(interval);
    }, 150);
  };

  const handleRemove = (key) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: { file: null, status: 'pending', error: undefined, previewUrl: undefined, progress: 0 },
    }));
  };

  const allDocumentsUploaded = requiredDocuments.every((doc) => documents[doc.key]?.status === 'uploaded');

  const handleSubmit = async () => {
    if (!allDocumentsUploaded) {
      toast({
        title: 'Documents required',
        description: 'Please upload all required documents before submitting.',
        variant: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    toast({
      title: 'Documents submitted',
      description: 'Your ownership documents have been submitted for verification. We will review them shortly.',
      variant: 'success',
    });
    navigate('/properties');
  };

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-semibold">Property not found</p>
            <p className="text-muted-foreground text-sm">Please start from your properties list.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">1</div>
            <span className="text-sm text-muted-foreground hidden sm:inline">Property Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-primary"></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">2</div>
            <span className="text-sm font-medium">Ownership Verification</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Step 2 — Property Ownership Verification</h1>
          <p className="text-muted-foreground">
            Continue by uploading the required ownership documents for <strong>{property.title}</strong>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Upload all required documents to complete the verification process and verify you are the legal owner or authorized
              representative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRejected && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Documents were rejected</p>
                  <p className="text-sm">{rejectionReason || 'Please re-upload the documents for re-review.'}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <Info className="h-4 w-4 mt-0.5" />
              <p>These documents are required to verify property ownership.</p>
            </div>

            <div className="grid gap-6">
              {requiredDocuments.map((doc) => {
                const docState = documents[doc.key];
                const isUploading = docState.status === 'uploading';
                const isInvalid = docState.status === 'invalid';
                const isUploaded = docState.status === 'uploaded';

                return (
                  <div key={doc.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{doc.label}</Label>
                      {isUploaded && (
                        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          <span>Uploaded</span>
                        </div>
                      )}
                    </div>

                    <input
                      id={`${doc.key}-input`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleDocumentSelect(doc.key, e.target.files)}
                    />

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer ${
                        isInvalid ? 'border-destructive/70 bg-destructive/5' : ''
                      }`}
                      onClick={() => document.getElementById(`${doc.key}-input`)?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDocumentSelect(doc.key, e.dataTransfer.files);
                      }}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">Drag and drop PDF, JPG, or PNG files here.</p>
                    </div>

                    {isUploading && (
                      <div className="space-y-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${docState.progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Uploading... {docState.progress}%</p>
                      </div>
                    )}

                    {isInvalid && docState.error && (
                      <p className="text-xs text-destructive flex items-center justify-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {docState.error}
                      </p>
                    )}

                    {docState.file && !isUploading && (
                      <div className="border rounded-lg p-3 bg-muted">
                        <div className="flex items-start gap-3">
                          {docState.previewUrl ? (
                            <img src={docState.previewUrl} alt={doc.label} className="h-16 w-16 object-cover rounded flex-shrink-0" />
                          ) : (
                            <div className="h-16 w-16 rounded bg-background flex items-center justify-center flex-shrink-0">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={docState.file.name}>
                              {docState.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{Math.round(docState.file.size / 1024)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(doc.key);
                            }}
                            className="bg-card border rounded-full p-1.5 hover:bg-destructive/10 transition-colors flex-shrink-0"
                            aria-label="Remove document"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/properties')}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSubmit} disabled={!allDocumentsUploaded || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

