import { MapPin, Bed, Bath, Square, Heart, ArrowRight } from 'lucide-react';

export default function SquareListingCard({imageUrl , monthlyRental , name , location , noOfBed , noOfToilet ,noOfSqft , isBookMarked}){
    return(
        <div className="bg-white border-1 w-fit rounded-lg overflow-hidden">
            <div className="relative aspect-video max-w-[500px] overflow-hidden">
                <img src={imageUrl} alt="Property Image" className="h-full w-full object-cover"/>
                <div className="rounded-full bg-muted p-2 border absolute top-5 right-5 cursor-pointer"><Heart className={`stroke-muted-foreground w-7 h-7 ${isBookMarked? "fill-destructive stroke-none" : ""}`}/></div>
                <div className="px-3 rounded-md bg-muted absolute left-3 bottom-3 text-sm font-semibold">{`RM${monthlyRental}/month`}</div>
            </div>
            <div className="p-3 flex flex-col space-y-2">
                <h1 className="font-bold text-lg">{name}</h1>
                <p className="flex flex-row text-sm items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-1"/>{location}</p>
                <div className="flex flex-row space-x-5">
                    <p className="flex flex-row text-sm items-center text-muted-foreground"><Bed className="w-4 h-4 mr-1"/>{noOfBed}</p>
                    <p className="flex flex-row text-sm items-center text-muted-foreground"><Bath className="w-4 h-4 mr-1"/>{noOfToilet}</p>
                    <p className="flex flex-row text-sm items-center text-muted-foreground"><Square className="w-4 h-4 mr-1"/>{`${noOfSqft}sqft`}</p>
                </div>
                <button className="flex flex-row border-1 w-full items-center justify-center p-2 rounded-md bg-muted cursor-pointer">View Details <ArrowRight className="ml-2"/></button>
            </div>
        </div>
    )
}