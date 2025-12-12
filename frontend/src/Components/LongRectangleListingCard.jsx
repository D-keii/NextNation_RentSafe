import propertyImage from "../img/property-image.jpg"

export default function LongRectangleListingCard({imageUrl , propertyName , applyDate , status}){

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-3 rounded-xl gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                <img
                src={imageUrl}
                alt={propertyImage}
                className="w-full sm:w-[100px] aspect-square object-cover rounded-md flex-shrink-0"
                />
                <div className="flex flex-col">
                <p className="text-lg font-semibold truncate">{propertyName}</p>
                <p className="text-sm text-muted-foreground">{`Applied on ${applyDate}`}</p>
                </div>
            </div>
            <div className={`${statusClasses.bg} px-3 py-1 rounded-xl mt-2 sm:mt-0`}>
                <p className={`${statusClasses.text} font-semibold capitalize`}>{status}</p>
            </div>
        </div>

    )
}