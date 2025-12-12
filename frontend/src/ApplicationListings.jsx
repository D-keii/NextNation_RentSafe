import { Newspaper,Filter } from "lucide-react"
import LongRectangleListingCardApplications from "./Components/LongRectangleListingCardApplications"
import axios from './axios.js'
import { useState,useEffect,useContext } from "react"
import { UserContext } from "./Context/UserContext.jsx"
import propertyImage from "./img/property-image.jpg"
export default function ApplicationListings(){

    const {userProfile} = useContext(UserContext)
    const [applications,setApplications] = useState([])

    const fetchApplications = async()=>{
        try{
            const result = await axios.get(`/applications/${userProfile.ic}`);
            setApplications(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("Failed to fetch listings", err)
        }
    }

    useEffect(()=>{
        fetchApplications()
    },[])



    return(
        <div className="p-5 flex flex-col space-y-5">
            <div>
                <h1 className="font-bold text-2xl flex flex-row items-center"><Newspaper className="mr-3"/> My Applications</h1>
                <p className="text-muted-foreground">Track the status of your rental applications</p>
            </div>
            <div className="flex flex-row justify-between align-center">
                <p className="flex flex-row items-center"><Filter className="mr-2 w-5 h-5"/> Filter by status</p>
                <div className="flex flex-row space-x-5 align-center justify-center">
                    <div className="bg-accent text-white px-5 py-3 rounded-xl ">All</div>
                    <div className="px-5 py-3">Pending</div>
                    <div className="px-5 py-3">Approved</div>
                    <div className="px-5 py-3">Rejected</div>
                </div>
            </div>
            {
                applications.length !== 0 
                ?<div className="flex flex-col space-y-5">
                    {
                        applications.map((application,index)=>(
                            <LongRectangleListingCardApplications key={index} propertyId ={application.property.id} imageUrl={application.property?.photos[0] || propertyImage} propertyName={application.property.title} applyDate={application.property.createdAt.split('T')[0]} status={application.property.status} price={application.property.price} location={application.property.location}/>
                        ))
                    }
                </div>
                :<div className="text-center mt-30 text-xl">No applications found</div>
            }
        </div>
    )
}