import {LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "../config.js";
import NearbyHospitals from "./components/NearbyHospitals.jsx";

function App() {
  return (
    <>
      <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY}>
        <NearbyHospitals />
      </LoadScript>
    </>
  );
}

export default App;
