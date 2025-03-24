import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "../config.js";
import NearbyHospitals from "../src/components/NearbyHospitals.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room.jsx";
function App() {
  return (
    <>
      <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Room />} />
            <Route path="/hospital" element={<NearbyHospitals />} />
          </Routes>
        </BrowserRouter>
      </LoadScript>
    </>
  );
}

export default App;
