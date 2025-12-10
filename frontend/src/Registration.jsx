import { Home, Building2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Registration(){
    const [role,setRole] = useState("")

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
                <h1 className="text-center text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground text-center">Welcome, Ahmad Bin Abdullah! Let's set up your preferences.</p>
                <div className="flex flex-col space-y-8">
                    <div className="rounded-lg bg-muted p-4 space-y-4">
                        <p className="font-semibold text-muted-foreground">Verified Information</p>
                        <div className=" grid grid-cols-2 gap-4 ">
                            <div>
                                <p className="font-semibold text-muted-foreground">Full Name</p>
                                <p className="font-semibold">Ahmad Bin Abdullah</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">IC Number</p>
                                <p className="font-semibold">950101-01-1234</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">Age</p>
                                <p className="font-semibold">29 years old</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">Gender</p>
                                <p className="font-semibold">Male</p>
                        </div>
                        </div>
                    </div>
                    <div className='flex flex-col space-y-5'>
                        <p className="font-semibold">I am a....</p>
                        <div className="flex flex-row justify-between space-x-5">
                            <div onClick={()=>setRole("tenant")} className={`flex-1 flex flex-col rounded-md border-2 space-y-3 items-center justify-center px-10 py-4 cursor-pointer ${role === 'tenant' ? 'border-accent bg-accent/5 shadow-glow' : 'border-border hover:border-muted-foreground/30'}`}>
                                <div className={`p-3 rounded-[50%] ${role === 'tenant' ? 'bg-accent/10' : 'bg-muted'}`}>
                                    <Home className={`w-8 h-8 ${role === "tenant" ? "text-accent" : "text-muted-foreground"}`}/>
                                </div>  
                                <p className='font-semibold'>Tenant</p>  
                                <p className='text-muted-foreground whitespace-nowrap'>Looking for a place to rent</p>                           
                            </div>
                            <div onClick={()=>setRole("landlord")} className={`flex-1 flex flex-col rounded-md border-2 space-y-3 items-center justify-center px-10 py-4 cursor-pointer ${role === 'landlord' ? 'border-accent bg-accent/5 shadow-glow' : 'border-border hover:border-muted-foreground/30'}`}>
                                <div className={`p-3 rounded-[50%] ${role === 'landlord' ? 'bg-accent/10' : 'bg-muted'}`}>
                                    <Building2 className={`w-8 h-8 ${role === "landlord" ? "text-accent" : "text-muted-foreground"}`}/>
                               </div>
                                <p className='font-semibold'>Landlord</p>
                                <p className="text-muted-foreground whitespace-nowrap">I have a properties to rent out</p>
                            </div>
                        </div>
                    </div>
                    <button className=' cursor-pointer flex flex-row items-center justify-center gradient-primary text-white font-semibold text-md rounded-md p-3 hover:scale-105 active:scale-95'>Complete Setup <ArrowRight className="h-5 w-5 ml-2"/></button>
                </div>
            </div>
        </div>
    )
}