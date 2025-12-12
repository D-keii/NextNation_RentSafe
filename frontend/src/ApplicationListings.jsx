import { Newspaper,Filter } from "lucide-react"
import LongRectangleListingCardApplications from "./Components/LongRectangleListingCardApplications"
import axios from './axios.js'
import { useState,useEffect,useContext } from "react"
import { UserContext } from "./Context/UserContext.jsx"
import propertyImage from "./img/property-image.jpg"
export default function ApplicationListings(){

    const {userProfile} = useContext(UserContext)
    const [applications,setApplications] = useState([])
    const [filterStatus,setFilterStatus] = useState("All")
    const statusOptions = ["All","Pending","Approved","Rejected"]

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


    const filteredApplications = filterStatus === "All" ? applications : applications.filter(app => app.status === filterStatus.toLowerCase())


    return(
        <div className="p-5 flex flex-col space-y-5">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div>
                        <h1 className="font-bold text-2xl flex items-center gap-2">
                            <Newspaper className="w-6 h-6" /> My Applications
                        </h1>
                        <p className="text-muted-foreground text-sm">Track the status of your rental applications</p>
                        </div>
                        
                        {/* Filter Label & Options */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                        <p className="flex items-center gap-2 text-sm">
                            <Filter className="w-5 h-5" /> Filter by status
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((statusOption, index) => (
                            <div
                                key={index}
                                onClick={() => setFilterStatus(statusOption)}
                                className={`px-4 py-2 rounded-xl cursor-pointer ${
                                filterStatus === statusOption
                                    ? "bg-accent text-white"
                                    : "hover:bg-accent/20"
                                }`}
                            >
                                {statusOption}
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {
                filteredApplications.length !== 0 
                ?filteredApplications.map((application , index)=>(
                    <LongRectangleListingCardApplications
                        key={index}
                        propertyId ={application.property.id}
                        imageUrl={application.property?.photos[0] || propertyImage}
                        propertyName={application.property.title}
                        applyDate={application.property.createdAt.split('T')[0]}
                        status={application.status}
                        price={application.property.price} 
                        location={application.property.location}
                    />
                ))
                :<div className="text-center mt-30 text-xl">No applications found</div>
            }
        </div>
    )
}