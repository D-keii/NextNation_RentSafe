import { Search,Newspaper, Wallet, Heart,ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import SquareListingCard from "./Components/SquareListingCard.jsx"
import LongRectangleListingCard from "./Components/LongRectangleListingCard.jsx"
import {UserContext} from './Context/UserContext.jsx'
import { useContext } from "react"
export default function TenantDashboard(){

    const {userProfile} = useContext(UserContext)

    const dashboardSummaryCards = [
        {
            title:"Saved Listings",
            icon:Heart,
            number:1,
            color: 'text-destructive',
            href: "/saved"
        },

        {
            title:"Applications",
            icon:Newspaper,
            number:1,
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


    return(
        <div className="p-10 flex flex-col space-y-7">
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{`Welcome Back, ${userProfile.name}!`}</h1>
                    <p className="text-muted-foreground">Find your perfect rental today.</p>
                </div>
                <Link to="all-listings" className="flex flex-row bg-accent items-center text-white font-semibold rounded-md p-1.5"><Search className="w-5 h-5 mr-3"/> Browse All Listings</Link>
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
                        recommendListings.map((recommendListing , index)=>(
                            <SquareListingCard key={index} imageUrl={recommendListing.imageUrl}  monthlyRental={recommendListing.monthlyRental}  name={recommendListing.name}  location={recommendListing.location} noOfBed={recommendListing.noOfBed}  noOfToilet={recommendListing.noOfToilet} noOfSqft={recommendListing.noOfSqft}  isBookMarked={recommendListing.isBookMarked}/>
                        ))
                    }
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                <h2 className="text-2xl font-bold">Pending Applications</h2>
                {
                    rentalApplications.map((rentalApplication , index)=>(
                        <LongRectangleListingCard key={index} imageUrl={rentalApplication.photos[0]} propertyName={rentalApplication.title} applyDate={rentalApplication.createdAt} status={rentalApplication.status}/>
                    ))
                }
            </div>
        </div>
    )
}