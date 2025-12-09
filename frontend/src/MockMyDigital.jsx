import { Shield } from "lucide-react";
import { useState } from "react";

export default function MockMyDigital() {

    const [passwordType, setPasswordType] = useState("password")

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
                        <label htmlFor="" className="flex flex-col gap-3">
                            <p>IC Number</p>
                            <input type="text" className="shadow-md w-full h-10 border-1 border-gray-700 rounded-xs p-1" />
                        </label>
                        <label htmlFor="" className="flex flex-col gap-3">
                            <p>Password</p>
                            <input type={passwordType} className="shadow-sm w-full border-1 h-10 border-gray-700 rounded-xs p-1"/>
                        </label>
                        <label htmlFor="" className="flex flex-row items-center gap-2">
                            <p className="font-semibold">Show Password</p>
                            <input type="checkbox" className="w-4 h-4 accent-blue-500" onClick={()=>passwordType==="password" ? setPasswordType("text") : setPasswordType("password")}/>
                        </label>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition text-lg font-semibold">
                        <Shield className="h-5 w-5" />
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
