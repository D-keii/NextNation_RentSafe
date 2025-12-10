import { Shield } from "lucide-react";
import { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "./axios.js";
import { UserContext } from "./Context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function MockMyDigital() {

    const [passwordType, setPasswordType] = useState("password");
    const [searchParams] = useSearchParams();
    const session = searchParams.get("session");
    const {setUserProfile} = useContext(UserContext)
    const navigate = useNavigate()

    const handleLogin = async()=>{
        if (window.confirm("Are you sure you want to authorize RentSafe to access your identity?")){
            try{
                console.log(session)
                const result  = await axios.get(`/auth/callback?token=${session}`)
                console.log(result.data)
                if(result.data){
                    setUserProfile({
                        ...result.data.profile,
                        user_id: result.data.user_id
                    })
                }
                navigate("/register")
            }
            catch(err){
                console.log("Failed to fetch user profile" , err)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                <Shield className="h-12 w-12 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">MyDigital ID</h1>
                <p className="text-gray-500 text-sm">Secure Login</p>
                </div>

                <form action="" className="flex flex-col gap-5">
                    <div className="flex flex-col gap-5">
                        <label className="flex flex-col gap-3">
                            <p>IC Number</p>
                            <input type="text" className="shadow-md w-full h-10 border-1 border-gray-700 rounded-xs p-1" />
                        </label>
                        <label  className="flex flex-col gap-3">
                            <p>Password</p>
                            <input type={passwordType} className="shadow-sm w-full border-1 h-10 border-gray-700 rounded-xs p-1"/>
                        </label>
                        <label className="flex flex-row items-center gap-2">
                            <p className="font-semibold">Show Password</p>
                            <input type="checkbox" className="w-4 h-4 accent-blue-500" onClick={()=>passwordType==="password" ? setPasswordType("text") : setPasswordType("password")}/>
                        </label>
                    </div>
                    <button type="button" onClick={()=>handleLogin()}className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition text-lg font-semibold">
                        <Shield className="h-5 w-5" />
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
