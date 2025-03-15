import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "../../config";
const HospitalMap = ({ location, hospitals }) => {
  const mapStyles = {
    height: "400px",
    width: "100%",
  };

  const defaultCenter = {
    lat: hospitals.length > 0 ? hospitals[0].geometry.location.lat : 28.6139, // Default to Delhi (or any fallback location)
    lng: hospitals.length > 0 ? hospitals[0].geometry.location.lng : 77.209,
  };
  return (
    <GoogleMap mapContainerStyle={mapStyles} zoom={15} center={defaultCenter}>
      <Marker position={defaultCenter} label="you">
        {hospitals.map((hospital, index) => {
          <Marker
            key={index}
            position={{ lat: hospital.latitude, lng: hospital.longitude }}
            label="H"
          />;
        })}
      </Marker>
    </GoogleMap>
  );
};

export default HospitalMap;
