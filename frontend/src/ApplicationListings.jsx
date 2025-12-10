import { Newspaper,Filter } from "lucide-react"
import LongRectangleListingCardApplications from "./Components/LongRectangleListingCardApplications"
import propertyImage from "./img/property-image.jpg"
export default function ApplicationListings(){

    const applications = [
        {
            imageUrl: propertyImage,
            propertyName: "Sunway Geo Residence",
            applyDate: "2025-12-01",
            status: "approved",
            price: 1800,
            location: "Bandar Sunway",
        },
        {
            imageUrl: propertyImage,
            propertyName: "Eco Sky Residence",
            applyDate: "2025-12-03",
            status: "rejected",
            price: 2400,
            location: "Cheras",
        },
        {
            imageUrl: propertyImage,
            propertyName: "PV 15 Condo",
            applyDate: "2025-12-05",
            status: "pending",
            price: 1500,
            location: "Setapak",
        },
        {
            imageUrl: propertyImage,
            propertyName: "M Vertica",
            applyDate: "2025-12-07",
            status: "reviewing",
            price: 3200,
            location: "KL City",
        },
        {
            imageUrl: propertyImage,
            propertyName: "Pangsapuri Putra Damai",
            applyDate: "2025-12-08",
            status: "under-verification",
            price: 900,
            location: "Putrajaya",
        },
    ];

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
            <div className="flex flex-col space-y-5">
                {
                    applications.map((application,index)=>(
                        <LongRectangleListingCardApplications key={index} imageUrl={application.imageUrl} propertyName={application.propertyName} applyDate={application.applyDate} status={application.status} price={application.price} location={application.location}/>
                    ))
                }
            </div>
        </div>
    )
}