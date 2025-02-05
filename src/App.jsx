import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./components/Dashboard";
import ShipmentDetails from "./components/ShipmentMap";

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/shipment-location/:shipmentId' element={<ShipmentDetails/>}/>
      </Routes>
    </Router>
  )
}

export default App
