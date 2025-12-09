import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './Login.jsx'
import MockMyDigital from './MockMyDigital.jsx'
import Registration from './Registration.jsx'


function AppRoutes(){
  return(
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/mock-mydigital" element={<MockMyDigital/>}/>
      <Route path="/register" element={<Registration/>}/>
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
