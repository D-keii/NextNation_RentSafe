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
        <div className="flex flex-row justify-between items-center border-1 p-3 rounded-xl">
            <div className="flex flex-row items-center space-x-5">
                <img src={imageUrl} alt="Property Image" className="aspect-square max-w-[100px] object-cover rounded-md" />
                <div>
                    <p className="text-lg font-semibold">{propertyName}</p>
                    <p className="text-sm text-muted-foreground">{`Applied on ${applyDate}`}</p>
                </div>
            </div>
            <div className={`${statusClasses.bg} px-2 rounded-xl`}>
                <p className={`${statusClasses.text} font-semibold text-transform: capitalize`}>{status}</p>
            </div>
        </div>
    )
}