import {
  Wallet,
  Shield,
  Building2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { Link } from 'react-router-dom';
export default function TenantEscrow(){

    const escrowSummaryCards = [
        {
            title:"Funds Secured",
            icon:Shield,
            amount:100,
            color: 'text-emerald-500',
            bg:'bg-emerald-500/10',
            href: "/saved"
        },

        {
            title:"Pending Release",
            icon:Clock,
            amount:3000,
            color: 'text-amber-500',
            bg:'bg-amber-500/10',
            href:"/applications"
        },

        {
            title:"Total Released",
            icon:CheckCircle2,
            amount:100,
            color: 'text-blue-500',
            bg:'bg-blue-500/10',
            href:"/tenant-escrow"
        }
    ]   
    return(
        <div className="p-10 flex flex-col space-y-7">
            <div>
                <h1 className="font-bold text-2xl flex flex-row items-center"><Wallet className="mr-3"/> Escrow Management</h1>
                <p className="text-muted-foreground">Manage your rental deposits and payment status</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {
                    escrowSummaryCards.map((escrowSummaryCard,index)=>(
                        <Link to={escrowSummaryCard.href} key={index}>
                            <div className="flex flex-row border-2 justify-between p-8 rounded-lg items-center ">
                                <div>
                                    <p>{escrowSummaryCard.title}</p>
                                    <h1 className="font-bold text-3xl">{`RM ${escrowSummaryCard.amount}`}</h1>
                                </div>
                                <div className={`rounded-lg ${escrowSummaryCard.bg} p-3`}>
                                    {<escrowSummaryCard.icon className={`${escrowSummaryCard.color}`}/>}
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </div>
            <div className="border-2 rounded-md border-amber-200 bg-amber-50/50  p-5 flex flex-col space-y-5">
                <div>
                    <p className='text-2xl flex flex-row items-center font-bold text-amber-700'><CreditCard className='mr-3'/>Pending Deposit Payments</p>
                    <p className='text-muted-foreground'>These contracts require deposit payment to secure your rental</p>
                </div>
                <div className='flex flex-col items-center justify-between'>
                    <div className='rounded-lg border-2 p-5 w-[95%] flex flex-row justify-between'>
                        <div className='flex flex-row space-x-3'>
                            <div className='bg-muted-foreground/10 p-3 rounded-lg'>
                                <Building2/>
                            </div>
                            <div className='flex flex-col'>
                                <p className='font-semibold text-lg'>Luxury Penthouse in Damansara Heights</p>
                                <p className='text-muted-foreground text-md'>Deposit: RM 24,000 (2 months)</p>
                            </div>
                       </div>
                        <button className='cursor-pointer gradient-primary text-white px-5 py-2 flex flex-row rounded-md justify-between items-center'><CreditCard className='mr-2'/> Pay Now</button>
                    </div>
                </div>
            </div>
            <div className="border border-2 rounded-md flex flex-col p-5 space-y-5">
                <div className='rounded-lg'>
                    <p className='text-2xl flex flex-row items-center font-bold'>Escrow Record</p>
                    <p className='text-muted-foreground'>All your escrow transactions and their current status</p>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div className='rounded-lg border-2 p-5 flex flex-row justify-between'>
                        <div className="flex flex-row space-x-3">
                            <Shield className='text-accent'/>
                            <div className='flex flex-col space-y-2'>
                                <p className='font-bold'>Cozy 2BR Condo in Bangsar South</p>
                                <p className='text-muted-foreground'>Bangsar South</p>
                                <div className='flex flex-row space-x-3'>
                                    <div className='rounded-lg px-3 bg-muted-foreground/10 items-center justify-between flex flex-col'>Fpx</div>
                                    <div className='flex flex-row items-center justify-center space-x-2'>
                                        <Calendar className='w-4 h-4'/>
                                        <p className='text-sm'>Paid: 2024-02-25</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-end space-y-2'>
                            <p className='font-bold text-lg'>RM4,400</p>
                            <div className='text-accent bg-accent/10 p-1 rounded-xl text-sm flex-col flex items-center'>Secured</div>
                            <button className='flex flex-row rounded-lg border border-2 bg-muted-foreground/10 items-center text-md p-1' ><ArrowUpRight className='w-5 h-5'/> Request Release</button>
                        </div>
                    </div>
                    <div className='rounded-lg border-2 p-5 flex flex-row justify-between'>
                        <div className="flex flex-row space-x-3">
                            <AlertCircle className='text-destructive'/>
                            <div className='flex flex-col space-y-2'>
                                <p className='font-bold'>Family Home in Mont Kiara</p>
                                <p className='text-muted-foreground'>Mont Kiara</p>
                                <div className='flex flex-row space-x-3'>
                                    <div className='rounded-lg px-3 bg-muted-foreground/10 items-center justify-between flex flex-col'>Fpx</div>
                                    <div className='flex flex-row items-center justify-center space-x-2'>
                                        <Calendar className='w-4 h-4'/>
                                        <p className='text-sm'>Paid: 2024-02-25</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-end space-y-2'>
                            <p className='font-bold text-lg'>RM9,400</p>
                            <div className='text-destructive bg-destructive/20 p-1 rounded-xl text-sm flex-col flex items-center'>Disputed</div>
                            <button className='flex flex-row rounded-lg border border-2 bg-muted-foreground/10 items-center text-md p-1' ><ArrowUpRight className='w-5 h-5'/> Request Release</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border border-2 rounded-md flex flex-row p-5 space-x-5 " >
                <Shield className=' w-15 h-15'/>
                <div>
                    <p className='font-bold text-lg'>RentSafe Escrow Protection</p>
                    <p className='text-muted-foreground text-sm'>Your deposit is securely held in escrow until the end of your tenancy. Funds can only be released when both tenant and landlord agree, or through our dispute resolution process. This protects both parties and ensures fair handling of deposits.</p>
                </div>
            </div>
        </div>
    )
}