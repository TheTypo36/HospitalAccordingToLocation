import { useState, useEffect } from "react";

import useLiveLocation from "./useLiveLocation.js";

const NearbyHospitals = () => {
  const { location, error } = useLiveLocation();

  const [hospitals, setHospitals] = useState([]);

  const fetchNearByHospital = async (latitude, longitude) => {
    const apiKey = "AIzaSyB-irOAyomJqmStg6RcJ5rZ2TLB28msNJQ";
    const radius = 10000;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // This won't work unless set on the server
        },
        mode: "cors", // "no-cors" will block the response data
      });
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("error in fetching hospitals:", error);

      return [];
    }
  };
  useEffect(() => {
    if (location) {
      fetchNearByHospital(location.latitude, location.longitude).then(
        (response) => setHospitals(response)
      );
    }
  }, [location]);

  return (
    <div>
      <h2>Nearby Hospitals</h2>
      {!location && <p> fetching location .....</p>}
      {hospitals.length > 0 ? (
        <ul>
          {hospitals.map((hospital) => {
            <li key={hospital.place_id}>
              {hospital.name} - {hospital.vicinity}
            </li>;
          })}
        </ul>
      ) : (
        <p> no hospitals found nearby</p>
      )}
    </div>
  );
};

export default NearbyHospitals;
