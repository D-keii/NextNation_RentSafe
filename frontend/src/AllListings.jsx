import { Search } from "lucide-react";
import axios from './axios.js'
import { useState, useEffect } from "react";
import SquareListingCard from "./Components/SquareListingCard.jsx";

export default function AllListings(){

    const [allListings, setAllListings] = useState([])
    const fetchListings = async()=>{
        try{
            const result = await axios.get("/properties/all");
            setAllListings(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Failed to fetch listings" , err)
        }
    }

    useEffect(()=>{
        fetchListings()
    },[])

    return(
        <div className="p-5 flex flex-col space-y-5">
            <div>
                <h1 className="font-bold text-2xl flex flex-row items-center"> Property Listings</h1>
                <p className="text-muted-foreground">Browse all available rental properties</p>
            </div>
            <div className="flex flex-row space-x-3">
            <div className="relative w-3/5">
                <input
                type="text"
                placeholder="Search by title or location"
                className="w-full border-2 border-gray-300 p-2 pl-10 rounded-lg"
                />
                <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
            </div>
            <select className="w-1/5 border-2 border-gray-300 p-2 rounded-lg">
                <option value="">All prices</option>
                <option value="">Under RM1500</option>
                <option value="">RM1500 - RM2000</option>
                <option value="">Above RM2500</option>
            </select>
            <select className="w-1/5 border-2 border-gray-300 p-2 rounded-lg">
                <option value="">All beds</option>
                <option value="">1 bedroom</option>
                <option value="">2 bedrooms</option>
                <option value="">3+ bedrooms</option>
            </select>
            </div>
            <p>{`Showing ${allListings.length} properties`}</p>
            <div className="grid grid-cols-3 gap-3">
                {
                    allListings.map((listing , index)=>(
                        <SquareListingCard key={index} propertyId={listing.id} imageUrl={listing.photos[0]}  monthlyRental={listing.price}  name={listing.title}  location={listing.location} noOfBed={listing.bedrooms}  noOfToilet={listing.bathrooms} noOfSqft={listing.size} />
                    ))
                }
            </div>
        </div>
    )
}

