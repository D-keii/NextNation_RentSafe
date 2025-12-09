import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './Login.jsx'
import MockMyDigital from './MockMyDigital.jsx'


function AppRoutes(){
  return(
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/mock-mydigital" element={<MockMyDigital/>}/>
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
