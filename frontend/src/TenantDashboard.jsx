import { Search,Newspaper, Wallet, Heart,ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import SquareListingCard from "./Components/SquareListingCard.jsx"
import LongRectangleListingCard from "./Components/LongRectangleListingCard.jsx"
import {UserContext} from './Context/UserContext.jsx'
import { useContext, useEffect, useState} from "react"
import axios from './axios.js'
export default function TenantDashboard(){

    const {userProfile} = useContext(UserContext)
    const [properties,setProperties] = useState([])
    const [applications ,setApplications] = useState([])
    const [savedProperties, setSavedProperties] = useState([]);

    useEffect(() => {
        const fetchSavedProperties = async (userId) => {
            try {
                const response = await axios.get(`/listings/saved/${userId}`); 
                setSavedProperties(response.data);
            } catch (err) {
                console.error("Failed to fetch detailed saved properties:", err);
                setSavedProperties([]);
            }
        };

        if (userProfile?.user_id) {
            fetchSavedProperties(userProfile.user_id);
        } else {
            setSavedProperties([]);
            setIsLoading(false);
        }
    }, [userProfile]);

    const dashboardSummaryCards = [
        {
            title:"Saved Listings",
            icon:Heart,
            number:savedProperties.length,
            color: 'text-destructive',
            href: "/saved"
        },

        {
            title:"Applications",
            icon:Newspaper,
            number:applications.length,
            color: 'text-warning',
            href:"/applications"
        },

        {
            title:"Active Escrows",
            icon:Wallet,
            number:1,
            color: 'text-success',
            href:"/tenant-escrow"
        }
    ]

    const fetchProperties = async()=>{
        try{
            const results = await axios.get("/properties/all")
            setProperties(results.data)
            console.log(results.data)
        }
        catch(err){
            console.error("Failed to fetch properties")
        }
    }

    const fetchApplications = async()=>{
        try{
            const results = await axios.get(`/applications/${userProfile.ic}`)
            setApplications(results.data)
            console.log(results.data)
        }
        catch(err){
            console.error("Failed to fetch user applications" ,err)
        }
    }

    useEffect(()=>{
        fetchProperties()
        fetchApplications()
    },[])



    return(
        <div className="p-10 flex flex-col space-y-7">
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{`Welcome Back, ${userProfile.name}!`}</h1>
                    <p className="text-muted-foreground">Find your perfect rental today.</p>
                </div>
                <Link to="/all-listings" className="flex flex-row bg-accent items-center text-white font-semibold rounded-md p-1.5"><Search className="w-5 h-5 mr-3"/> Browse All Listings</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {
                    dashboardSummaryCards.map((dashboardSummaryCard,index)=>(
                        <Link to={dashboardSummaryCard.href} key={index}>
                            <div className="flex flex-row border-2 justify-between p-8 rounded-lg items-center ">
                                <div>
                                    <p>{dashboardSummaryCard.title}</p>
                                    <h1 className="font-bold text-3xl">{dashboardSummaryCard.number}</h1>
                                </div>
                                <div className="rounded-full bg-muted p-3">
                                    {<dashboardSummaryCard.icon className={`${dashboardSummaryCard.color}`}/>}
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </div>
            <div className="rounded-md border border-success/20 bg-success/5 p-5 flex flex-col space-y-3">
                <p className="flex flex-row items-center text-accent font-bold text-2xl"><Wallet className="mr-3"/>Escrow Status</p>
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">Deposit Amount</p>  
                        <h1 className="font-bold text-2xl">RM 4,400</h1> 
                        <p className="text-muted-foreground">Your deposit is securely held in escrow and will be released according to contract terms.</p>        
                    </div>
                    <div>
                        <p className="px-2 text-center rounded-4xl text-sm font-semibold text-accent border border-success/20 bg-success/5">Secured</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                <div className="flex flex-row items-center justify-between">
                    <h2 className="text-2xl font-bold">Recommended For You</h2>
                    <Link to="/all-listings" className="flex flex-row p-2 hover:bg-muted-foreground/10 rounded-md">View All <ArrowRight className="ml-2"/></Link>
                </div>
                <div className="grid grid-cols-3 gap-5">
                    {
                        properties.slice(0,3).map((recommendListing , index)=>(
                            <SquareListingCard key={index} propertyId={recommendListing.id} imageUrl={recommendListing.photos[0]}  monthlyRental={recommendListing.price}  name={recommendListing.title}  location={recommendListing.location} noOfBed={recommendListing.bedrooms}  noOfToilet={recommendListing.bathrooms} noOfSqft={recommendListing.size}/>
                        ))
                    }
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                <h2 className="text-2xl font-bold">Pending Applications</h2>
                {
                    applications.map((rentalApplication , index)=>(
                        <LongRectangleListingCard key={index} imageUrl={rentalApplication.photos[0]} propertyName={rentalApplication.title} applyDate={rentalApplication.createdAt} status={rentalApplication.status}/>
                    ))
                }
            </div>
        </div>
    )
}