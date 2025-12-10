import  {createContext, useState} from 'react';

export const UserContext = createContext();

export const UserProvider = ({children})=>{
    const [userProfile , setUserProfile] = useState(()=>{
        const savedUserProfile = localStorage.getItem("userProfile")
        if (savedUserProfile) {
            return JSON.parse(savedUserProfile)
        }
        return null
    });

    const saveUserProfile = (profile)=>{
        setUserProfile(profile);
        localStorage.setItem("userProfile" , JSON.stringify(profile))
    }

    return (
        <UserContext.Provider value = {{userProfile , setUserProfile:saveUserProfile}}>
            {children}
        </UserContext.Provider>
    )
}