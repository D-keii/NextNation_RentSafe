import propertyImage from "../img/property-image.jpg"
import { Building,Calendar,ArrowRight } from "lucide-react";
export default function LongRectangleListingCardApplications({imageUrl , propertyName , applyDate , status , price , location}){

    const getStatusClasses = () => {
        if (status === "approved") {
            return {
                bg: "bg-accent/10",
                text: "text-accent"
            };
        } else if (status === "pending") {
            return {
                bg: "bg-warning/10",
                text: "text-warning"
            };
        } else {
            return {
                bg: "bg-destructive/10",
                text: "text-destructive"
            };
        }
    };

    const statusClasses = getStatusClasses();

    return(
        <div className="flex flex-row items-center border-1 rounded-xl  justify-between">
            <div className="flex flex-row items-center space-x-5">
                <img src={imageUrl} alt={propertyImage} className="aspect-square max-w-[180px] object-cover rounded-md" />
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-row space-x-3 items-center">
                        <p className="text-lg font-semibold">{propertyName}</p>
                        <div className={`${statusClasses.bg} px-2 rounded-xl`}>
                            <p className={`${statusClasses.text} font-semibold text-transform: capitalize`}>{status}</p>
                        </div>                  
                    </div>
                    <div className="flex flex-row space-x-5 items-center ">
                        <p className="flex flex-row items-center"><Building className="mr-3"/>{location}</p>
                        <p className="flex flex-row items-center"><Calendar className="mr-3"/>{`Applied: ${applyDate}`}</p>
                    </div>
                    <h2 className="text-accent font-bold text-xl">{`RM ${price}/month`}</h2>
                </div>
            </div>
            <button className="mr-5 flex flex-row border-2 p-3 rounded-md b-muted cursor-pointer">View Property <ArrowRight className="ml-3"/></button>
        </div>
    )
}