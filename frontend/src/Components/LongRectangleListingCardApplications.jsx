import propertyImage from "../img/property-image.jpg"
import { Building,Calendar,ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export default function LongRectangleListingCardApplications({propertyId , imageUrl , propertyName , applyDate , status , price , location}){

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center border rounded-xl p-4 gap-4 sm:gap-0 justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                    <img
                    src={imageUrl}
                    alt={propertyImage}
                    className="w-full sm:w-[180px] aspect-square object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex flex-col space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                        <p className="text-lg font-semibold truncate">{propertyName}</p>
                        <div className={`${statusClasses.bg} px-2 py-1 rounded-xl`}>
                            <p className={`${statusClasses.text} font-semibold capitalize`}>{status}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-5 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1"><Building className="mr-1" />{location}</p>
                        <p className="flex items-center gap-1"><Calendar className="mr-1" />{`Applied: ${applyDate}`}</p>
                    </div>
                    <h2 className="text-accent font-bold text-xl">{`RM ${price}/month`}</h2>
                    </div>
                </div>
                <Link
                    to={`/listing/${propertyId}?applied=true`}
                    className="flex items-center justify-center sm:mt-0 mt-2 border-2 border-muted p-3 rounded-md text-center cursor-pointer hover:bg-muted/20 transition"
                >
                    View Property <ArrowRight className="ml-2" />
                </Link>
            </div>
    )
}