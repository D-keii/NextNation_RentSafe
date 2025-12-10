import Logo from "./Components/Logo"
import { Shield,Lock,FileCheck,Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "./axios.js"
export default function Login(){

    const features = [
        {
            icon: Shield,
            title: 'Verified Identity',
            desc: 'All users verified through MyDigital ID',
        },
        {
            icon: Lock,
            title: 'Secure Escrow',
            desc: 'Deposits protected until move-in',
        },
        {
            icon: FileCheck,
            title: 'Digital Contracts',
            desc: 'Legally binding with digital signatures',
        },
        {
            icon: Wallet,
            title: 'Easy Payments',
            desc: 'FPX and DuitNow supported',
        },
    ];

    const redirectToMyDigital = async()=>{
        try{
            const response = await axios.get("/auth/login-mydigitalid");
            const data = response.data;
            window.location.href = data.redirect_url;
        }
        catch(err){
            console.log("Failed to fetch url" , err)
        }
    }

    const loginSteps = [
                        "Click Login with MyDigital ID",
                        "Verify your identity in the MyDigital ID app",
                        "Complete your profile and start renting"
                    ]
    
    const navigate = useNavigate()

    return(
        <div className="flex flex-col w-[90%] pt-[50px] items-center justify-center mx-auto">
            <header className="container">
                <Logo size="lg"/>
            </header>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mx-auto w-full py-20">
                <div className="flex-1 flex flex-col gap-5">
                    <span className="text-4xl md:text-5xl font-bold leading-tight">Rent With <span className="text-accent">Confidence</span></span>
                    <p className="text-lg text-muted-foreground max-w-md">Malaysia's trusted rental platform with verified identities, secure escrow, and digital contracts.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {
                            features.map((feature,index)=>(
                                <div key={index} className="flex flex items-center gap-4">
                                    <div className="text-accent bg-accent/10 rounded-lg p-2 mt-1">{<feature.icon/>}</div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{feature.title}</span>
                                        <span className="text-sm text-muted-foreground">{feature.desc}</span>
                                    </div>
                                </div>
                            ))
                        }
                   </div>
                </div>
                <div className="flex-1 bg-white px-8 md:px-5 py-10 rounded-md shadow-sm flex flex-col items-center justify-center gap-5 w-full">
                    <p className="text-3xl whitespace-nowrap font-bold leading-none tracking-tight">Welcome to RentSafe</p>
                    <p className="text-md text-muted-foreground">Sign in securely with your MyDigital ID</p>
                    <button onClick={()=>redirectToMyDigital() }className="w-full font-bold whitespace-nowrap gradient-primary flex items-center justify-center gap-3 py-3 px-6 rounded-md text-white text-sm cursor-pointer transform transition-transform duration-200 hover:scale-105 active:scale-95">
                        <Shield className="h-5 w-5" />
                        Login with MyDigital ID
                    </button>
                    <div className="w-full">
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center z-0">
                                <span className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center z-10">
                                <span className="bg-background px-2 py-0.5 text-muted-foreground text-xs uppercase">
                                How it works
                                </span>
                            </div>
                        </div>
                        <ol className="space-y-3 text-sm text-muted-foreground">
                            {
                                loginSteps.map((loginStep,index)=>(
                                    <li key={index} className="flex items-center gap-3 text-l">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-md font-medium text-primary-foreground">{index + 1}</span>
                                        {loginStep}
                                    </li>
                                ))
                            }
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )

}