import { useState,useEffect, useContext} from 'react';
import axios from "./axios.js"
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './Components/ToastContext.jsx';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
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
import { UserContext } from './Context/UserContext.jsx';


export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSaved, setIsSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [property , setProperty] = useState()
    const {userProfile} = useContext(UserContext)

    const fetchProperty = async()=>{
        try{
            const result  = await axios.get(`/properties/${id}`)
            setProperty(result.data)
        }
        catch(err){
            console.error("Failed to fetch property",err)
        }
    }

    useEffect(()=>{
        fetchProperty()
    },[id])

    const handleApply = async () => {
        if (!userProfile) {
        toast.error('You must be logged in to apply.');
        return;
        }

        setIsApplying(true);
        try {
        const payLoad = {
            tenant_ic: userProfile.ic,
            property_id: property.id, // make sure property is defined in your component
        };

        await axios.post('/applications/create', payLoad);
        console.log(payLoad)

        toast({
            title: 'Application submitted',
            description: 'The landlord will review your application.',
            variant: 'success',
        });
        navigate('/applications');
        } catch (err) {
        console.error('Failed to apply to rent', err);
        toast({
            title: 'Failed to apply to rent',
            description: 'Error to submit your application.',
            variant: 'error',
        });
        } finally {
        setIsApplying(false);
        }
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Removed from saved' : 'Added to saved listings');
    };

        if (!property) {
        return (
        <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        );
    }


    return (
        <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
            {/* Property Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                src={property.photos[0] || '/placeholder.svg'}
                alt={property.title}
                className="h-full w-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleSave}
                    className="bg-card/90 backdrop-blur-sm"
                >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
                </div>
            </div>

            {/* Property Info */}
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
                    <p className="text-3xl font-bold text-accent">
                    RM {property.price.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">per month</p>
                </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Stats */}
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

                {/* Description */}
                <div>
                <h2 className="text-lg font-semibold mb-3">About this property</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                <Separator className="my-6" />

                {/* Amenities */}
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

            {/* Sidebar */}
            <div className="space-y-6">
            {/* Apply Card */}
            <Card className="">
                <CardHeader>
                <CardTitle>Interested in this property?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="text-center py-4">
                    <p className="text-3xl font-bold">RM {property.price.toLocaleString()}</p>
                    <p className="text-muted-foreground">per month</p>
                    <p className="text-sm text-muted-foreground mt-2">
                    Deposit: RM {(property.price * 2).toLocaleString()} (2 months)
                    </p>
                </div>
                <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={handleApply}
                    disabled={isApplying}
                >
                    {isApplying ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Submitting...
                    </>
                    ) : (
                    'Apply to Rent'
                    )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Your application will be reviewed by the landlord
                </p>
                </CardContent>
            </Card>

            {/* Landlord Info */}
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
                    <p className="font-medium">{property.landlordName}</p>
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

            {/* Security Notice */}
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
