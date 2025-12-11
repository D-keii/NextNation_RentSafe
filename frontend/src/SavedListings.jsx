import { Heart } from "lucide-react"
import propertyImage from "./img/property-image.jpg"
import SquareListingCard from "./Components/SquareListingCard";

export default function SavedListings (){

    const listings = [
        {   imageUrl:propertyImage,
            monthlyRental: 2100,
            name: "Residensi Hijauan",
            location: "Shah Alam",
            noOfBed: 3,
            noOfToilet: 2,
            noOfSqft: 980,
            isBookMarked: true,
        },
        {
            imageUrl:propertyImage,
            monthlyRental: 2600,
            name: "The Park Sky Residence",
            location: "Bukit Jalil",
            noOfBed: 3,
            noOfToilet: 2,
            noOfSqft: 1150,
            isBookMarked: true,
        },
        {
            imageUrl:propertyImage,
            monthlyRental: 1800,
            name: "Platinum Lake PV20",
            location: "Setapak",
            noOfBed: 2,
            noOfToilet: 2,
            noOfSqft: 800,
            isBookMarked: true,
        },
        {
            imageUrl:propertyImage,
            monthlyRental: 3500,
            name: "Aria Luxury Residence",
            location: "KLCC",
            noOfBed: 3,
            noOfToilet: 3,
            noOfSqft: 1300,
            isBookMarked: true,
        },
        {
            imageUrl:propertyImage,
            monthlyRental: 1600,
            name: "Scenaria @ North Kiara",
            location: "Segambut",
            noOfBed: 2,
            noOfToilet: 2,
            noOfSqft: 900,
            isBookMarked: true,
        },
        {
            imageUrl:propertyImage,
            monthlyRental: 2900,
            name: "Southville City Savanna",
            location: "Bangi",
            noOfBed: 3,
            noOfToilet: 2,
            noOfSqft: 1000,
            isBookMarked: true,
        },
    ];

    return(
        <div className="p-5 flex flex-col space-y-5">
            <div>
                <h1 className="font-bold text-2xl flex flex-row items-center"><Heart className="mr-3"/> Saved Listings</h1>
                <p className="text-muted-foreground">Properties you've saved for later</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
                {
                    listings.map((listing,index)=>(
                        <SquareListingCard key={index} imageUrl={listing.photos[0]}  monthlyRental={listing.price}  name={listing.title}  location={listing.location} noOfBed={listing.bedrooms}  noOfToilet={listing.bathrooms} noOfSqft={listing.size}/>
                    ))
                }
            </div>
        </div>
    )
}