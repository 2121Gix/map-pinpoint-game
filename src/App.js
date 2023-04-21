import './App.css';
import { useState , useEffect, useMemo} from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

function App() {

  const [hs, setHs] = useState(0);
  const [cs, setCs] = useState(0);
  const [round, setRound] = useState(1);
  const [city, setCity] = useState("");
  const [mark, setMark] = useState({});

  const {isLoaded} = useLoadScript({
    googleMapsApiKey: 'AIzaSyCVeusViA1g24A4tSRPde0fEj9wq9kkebs'
  });

  useEffect(() => {
    fetchCity();
  }, [])

  const fetchCity = () => {
    
    ajax({
      method: 'GET',
      url: 'https://api.api-ninjas.com/v1/city?min_population=100000',
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_NINJA_API_KEY},
      contentType: 'application/json',
      success: function(result) {
          console.log(result);
      },
      error: (err) => {
          setCity("Atlanta");
      }
  });

  }

  const choiceConfirmed = () => {
    setCity("sium");
    setRound(round+1);
  };

  const replay = () => {};

  const placeMarker = (ev) => {
    setMark({
      lat: ev.latLng.lat(),
      lng: ev.latLng.lng(), 
    })
  };

  return (
    <div className="App">
      <div className='gameover'>
        <p>Your Score: {cs}</p>
        <p>Highest Score: {hs}</p>
        <button className='replay' onClick={replay}>Play Again</button>
      </div>
      <div className='game'>
        <h4>(Round {round}/5) Point to: {city}</h4>
        <div className='map'>
          <GoogleMap zoom={1} center={{lat: 0 , lng: 0}} mapContainerClassName='map' onClick={(ev) => placeMarker(ev)}>

            {
              mark !== null &&
                <Marker
              title= ""
              name= ""
              position={mark}
            />
            }           
          </GoogleMap>
        </div>
        <button className='confirm' onClick={choiceConfirmed}>CONFIRM</button>
        <p>Current Score: {cs}</p>
      </div>
    </div>
  );
}

export default App;
