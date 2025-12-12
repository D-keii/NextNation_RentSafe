import { useState, useEffect, useContext } from 'react';
import { Heart, Loader2 } from "lucide-react";
import axios from "./axios.js";
import SquareListingCard from "./Components/SquareListingCard";
// import { useSavedStore } from "./useSavedStore.js"; // Not strictly needed here if fetching details directly
import { UserContext } from './Context/UserContext.jsx';
import { Button } from './Components/ui/button';

export default function SavedListings() {
    const { userProfile } = useContext(UserContext);
    
    // Local state to hold the detailed property objects
    const [savedProperties, setSavedProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch detailed saved properties directly from the backend
    useEffect(() => {
        const fetchSavedProperties = async (userId) => {
            setIsLoading(true);
            try {
                // Use the backend route you provided, which returns full details
                const response = await axios.get(`/listings/saved/${userId}`); 
                setSavedProperties(response.data);
            } catch (err) {
                console.error("Failed to fetch detailed saved properties:", err);
                setSavedProperties([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (userProfile?.user_id) {
            fetchSavedProperties(userProfile.user_id);
        } else {
             // Handle case where user is not logged in/profile not loaded
            setSavedProperties([]);
            setIsLoading(false);
        }
    }, [userProfile]);


    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="p-5 flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
                <span className="text-xl text-muted-foreground">Loading saved listings...</span>
            </div>
        );
    }

    if (!userProfile) {
        return (
             <div className="p-5 flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Heart className="h-10 w-10 text-muted-foreground" />
                <h1 className="font-bold text-2xl">Sign in to view your saved listings</h1>
                <p className="text-muted-foreground">Please log in to see the properties you've marked as favorites.</p>
                <Button onClick={() => console.log("Navigate to Login")}>Go to Login</Button>
            </div>
        )
    }

    if (savedProperties.length === 0) {
        return (
            <div className="p-5 flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Heart className="h-10 w-10 text-muted-foreground" />
                <h1 className="font-bold text-2xl">No Saved Listings</h1>
                <p className="text-muted-foreground">Start browsing properties and click the heart icon to save them here!</p>
                <Button onClick={() => window.location.href = '/'}>Start Browsing</Button>
            </div>
        );
    }

    return (
        <div className="p-5 flex flex-col space-y-5">
            <div>
                <h1 className="font-bold text-2xl flex flex-row items-center">
                    <Heart className="mr-3 fill-destructive text-destructive"/> Saved Listings
                </h1>
                <p className="text-muted-foreground">{savedProperties.length} properties you've saved for later</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {
                    savedProperties.map((listing) => (
                        <SquareListingCard 
                            key={listing.id}
                            id={listing.id}
                            imageUrl={listing.photos[0] || '/placeholder.svg'} 
                            monthlyRental={listing.price} 
                            name={listing.title} 
                            location={listing.address} 
                            noOfBed={listing.bedrooms} 
                            noOfToilet={listing.bathrooms} 
                            noOfSqft={listing.size}
                            // Important: Use the Zustand store internally within SquareListingCard 
                            // to handle the save/unsave interaction and ensure the heart icon stays synced.
                        />
                    ))
                }
            </div>
        </div>
    );
}