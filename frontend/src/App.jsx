import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "../config.js";
import NearbyHospitals from "../src/components/NearbyHospitals.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat.jsx";
function App() {
  return (
    <>
      <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NearbyHospitals />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </LoadScript>
    </>
  );
}

export default App;
