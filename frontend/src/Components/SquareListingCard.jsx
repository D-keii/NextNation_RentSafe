import { MapPin, Bed, Bath, Square, Heart, ArrowRight } from 'lucide-react';
import propertyImage from "../img/property-image.jpg";
import { Link } from "react-router-dom";
import { useSavedStore } from '../useSavedStore';
import { useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';

export default function SquareListingCard({
  propertyId,
  imageUrl,
  monthlyRental,
  name,
  location,
  noOfBed,
  noOfToilet,
  noOfSqft,
}) {
  // Ensure numeric ID for comparison
  const listingId = Number(propertyId);

  // Get user profile from context
  const { userProfile } = useContext(UserContext);
  const userId = userProfile?.user_id;

  // Zustand store
  const saved = useSavedStore((state) => state.saved);
  const toggleSave = useSavedStore((state) => state.toggleSave);
  const fetchSaved = useSavedStore((state) => state.fetchSaved); // fetch saved listings from backend

  // Load saved listings on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchSaved(userId);
    }
  }, [userId, fetchSaved]);

  // Check if this listing is saved
  const isSaved = saved.includes(listingId);

  // Handle heart click
  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!userId) {
      console.log("Action blocked: User is not logged in.");
      return;
    }

    toggleSave(userId, listingId);
  };

  return (
    <div className="bg-white border-1 w-fit rounded-lg overflow-hidden">
      <div className="relative aspect-video max-w-[500px] overflow-hidden">
        <img
          src={imageUrl}
          onError={(e) => (e.target.src = propertyImage)}
          className="h-full w-full object-cover"
        />
        <div
          onClick={handleToggle}
          className="rounded-full bg-muted p-2 border absolute top-5 right-5 cursor-pointer 
                     transition-transform duration-150 hover:scale-110 active:scale-95 z-10"
        >
          <Heart
            className={`
              h-7 w-7 transition-all duration-300 
              ${isSaved ? 'fill-destructive text-destructive scale-110' : 'stroke-muted-foreground'}
            `}
          />
        </div>

        {/* Price */}
        <div className="px-3 rounded-md bg-muted absolute left-3 bottom-3 text-sm font-semibold">
          RM{monthlyRental}/month
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col space-y-2">
        <h1 className="font-bold text-lg">{name}</h1>

        <p className="flex flex-row text-sm items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </p>

        <div className="flex flex-row space-x-5">
          <p className="flex flex-row text-sm items-center text-muted-foreground">
            <Bed className="w-4 h-4 mr-1" />
            {noOfBed}
          </p>
          <p className="flex flex-row text-sm items-center text-muted-foreground">
            <Bath className="w-4 h-4 mr-1" />
            {noOfToilet}
          </p>
          <p className="flex flex-row text-sm items-center text-muted-foreground">
            <Square className="w-4 h-4 mr-1" />
            {noOfSqft} sqft
          </p>
        </div>

        <Link
          to={`/listing/${listingId}`}
          className="flex flex-row border-1 w-full items-center justify-center p-2 rounded-md bg-muted 
                     cursor-pointer hover:bg-accent hover:text-white transition"
        >
          View Details
          <ArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
