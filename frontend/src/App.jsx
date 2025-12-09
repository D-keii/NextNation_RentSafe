import { BrowserRouter,Routes,Route,Outlet } from 'react-router-dom'
import Login from './Login.jsx'
import MockMyDigital from './MockMyDigital.jsx'
import Registration from './Registration.jsx'
import Navbar from './Components/Navbar.jsx'

import TenantDashboard from './TenantDashboard.jsx'
import SavedListings from './SavedListings.jsx'
import ApplicationListings from './ApplicationListings.jsx'


function AuthLayout (){
    return <Outlet/>
  }

function AppLayout (){
    return(
      <>
        <Navbar/>
        <Outlet/>
      </>
    )
  }

function AppRoutes(){
  return(
    <Routes>
      <Route element={<AuthLayout/>}>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/register" element={<Registration/>}/>
        <Route path="/mock-mydigital" element={<MockMyDigital/>}/>
      </Route>
      <Route element={<AppLayout/>}>
        <Route path="/tenant-dashboard" element={<TenantDashboard/>}/>
        <Route path="/saved" element={<SavedListings/>}/>
        <Route path="/applications" element={<ApplicationListings/>}></Route>
      </Route>
    </Routes>
  )
}


function App() {

  return (
    <BrowserRouter>
        <AppRoutes/>
    </BrowserRouter>
  )
}

export default App
