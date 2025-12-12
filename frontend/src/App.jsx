import { BrowserRouter,Routes,Route,Outlet } from 'react-router-dom'
import Login from './Login.jsx'
import MockMyDigital from './MockMyDigital.jsx'
import Registration from './Registration.jsx'
import { UserProvider } from './Context/UserContext.jsx'


import TenantDashboard from './TenantDashboard.jsx'
import SavedListings from './SavedListings.jsx'
import ApplicationListings from './ApplicationListings.jsx'
import TenantEscrow from './TenantEscrow.jsx'
import AllListings from './AllListings.jsx'
import ListingDetails from './ListingDetails.jsx'

import LandlordDashboard from './LandlordDashboard.jsx'
import Properties from './Properties.jsx'
import AddProperty from './AddProperty.jsx'
import PropertyVerification from './PropertyVerification.jsx'
import Applications from './Applications.jsx'
import ApplicationReview from './ApplicationReview.jsx'
import Contracts from './Contracts.jsx'
import ViewContract from './ViewContract.jsx'
import UploadPhotos from './UploadPhotos.jsx'
import Escrow from './Escrow.jsx'
import Profile from './Profile.jsx'
import { ToastProvider } from './Components/ToastContext.jsx'
import ScrollToTop from './Components/ScrollToTop.jsx'
import DashboardLayout from './Components/DashboardLayout.jsx'

function AuthLayout (){
    return <Outlet/>
  }

function AppLayout (){
    return(
        <DashboardLayout>
            <Outlet/>
        </DashboardLayout>
    )
  }

function AppRoutes(){
  return(
    <Routes>
      <Route element={<AuthLayout/>}>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Registration/>}/>
        <Route path="/mock-digitalid" element={<MockMyDigital/>}/>
      </Route>
      <Route element={<AppLayout/>}>
        <Route path="/tenant-dashboard" element={<TenantDashboard/>}/>
        <Route path="/landlord-dashboard" element={<LandlordDashboard/>}/>
        <Route path="/saved" element={<SavedListings/>}/>
        <Route path="/applications" element={<ApplicationListings/>}/>
        <Route path="/tenant-escrow" element={<TenantEscrow/>}/>
        <Route path="/all-listings" element = {<AllListings/>}/>
        <Route path="/listing/:id" element={<ListingDetails/>}/>

        {/* Landlord flows */}
        <Route path="/properties" element={<Properties/>}/>
        <Route path="/properties/new" element={<AddProperty/>}/>
        <Route path="/properties/:id" element={<ListingDetails/>}/>
        <Route path="/properties/:id/edit" element={<AddProperty/>}/>
        <Route path="/properties/:id/verification" element={<PropertyVerification/>}/>

        <Route path="/applications/list" element={<Applications/>}/>
        <Route path="/applications/:id/review" element={<ApplicationReview/>}/>

        <Route path="/contracts" element={<Contracts/>}/>
        <Route path="/contracts/:id" element={<ViewContract/>}/>
        <Route path="/contracts/:id/upload-photos" element={<UploadPhotos/>}/>

        <Route path="/escrow" element={<Escrow/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Route>
    </Routes>
  )
}


function App() {

  return (
    <ToastProvider>
      <UserProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes/>
        </BrowserRouter>
      </UserProvider>
    </ToastProvider>
  )
}

export default App
