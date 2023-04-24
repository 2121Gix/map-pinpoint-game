import './App.css';
import { useState , useEffect} from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import $ from 'jquery';

function App() {

  const [hs, setHs] = useState(0);
  const [cs, setCs] = useState(0);
  const [round, setRound] = useState(1);
  const [city, setCity] = useState("");
  const [cityCoords, setCityCoords] = useState({})
  const [mark, setMark] = useState({});
  const [markerFlag, setMarkerFlag] = useState(false);
  const [linePath, setLinePath]= useState([]);
  const [finalDisplay, setFinalDisplay] = useState("none");

  const {isLoaded} = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_KEY
  });

  useEffect(() => {
    fetchCity();
  }, [])

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  }

  const fetchCity = () => {
    let index = getRandomInt(29);
    let minpop = getRandomInt(900000) + 100000;
    let maxpop = getRandomInt(250000) + minpop;
    $.ajax({
      method: 'GET',
      url: 'https://api.api-ninjas.com/v1/city?min_population=' +minpop+ '&max_population='+maxpop+'&limit=30',
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_NINJA_KEY},
      contentType: 'application/json',
      success: function(result) {
        setCity(result[index].name);
        setCityCoords({
          lat: result[index].latitude,
          lng: result[index].longitude
        });
      },
      error: function ajaxError(jqXHR) {
        setCity("Atlanta");
        setCityCoords({
          lat: 33.7488,
          lng: 84.3877
        })
      }
  });
  }

  const choiceConfirmed = () => {
    setMarkerFlag(true);
    setLinePath ([mark, cityCoords]);
    const roundScore = Math.floor(6000-getdistance()*1.8);
    setCs(roundScore >= 0 ? cs+roundScore : cs);
  }

  const nextround = () => {
    setMark(null);
    setMarkerFlag(false);
    if(round === 5){
      setFinalDisplay("block");
      if(cs > hs){setHs(cs);}
      document.querySelector('.game').classList.add('blurred');
    }
    else
    {
      setRound(round+1);
      fetchCity();
    }
    
  };

  const placeMarker = (ev) => {
    setMark({
      lat: ev.latLng.lat(),
      lng: ev.latLng.lng(), 
    })
  }

  const getdistance = () => {
    const R = 6371e3; // metres
    const φ1 = mark.lat * Math.PI/180; // φ, λ in radians
    const φ2 = cityCoords.lat * Math.PI/180;
    const Δφ = (cityCoords.lat-mark.lat) * Math.PI/180;
    const Δλ = (cityCoords.lng-mark.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c / 1000; // in metres
    return Math.floor(d);
  }

  const replay = () => {
    setCs(0);
    setRound(1);
    setMarkerFlag(false);
    setMark(null);
    fetchCity();
    setFinalDisplay("none");
    document.querySelector('.game').classList.remove('blurred');
  }

  return (
    <div className="App">
      <div className='gameover' style={{display:finalDisplay}}>
        <p>Your Score: {cs}</p>
        <p>Highest Score: {hs}</p>
        <button className='replay' onClick={replay}>Play Again</button>
      </div>
      <div className='game'>
        <h4>(Round {round}/5) Point to: {city}</h4>
        <div className='map'>
          { isLoaded && <GoogleMap id='mappa' zoom={1} center={{lat: 0 , lng: 0}} mapContainerClassName='map' onClick={(ev) => placeMarker(ev)}>
            {
              mark !== null &&
                <Marker
              title= "Your Guess"
              name= ""
              position={mark}
            />
            } 
            {
              markerFlag &&
              <div>
                <Marker
              title= "Target"
              name= "Target"
              position={cityCoords}           
               />

              <Polyline
              path={linePath}                  
              /></div>
            }          
          </GoogleMap>}
        </div>
        <button className='confirm' onClick={choiceConfirmed} disabled={markerFlag || mark === null}>CONFIRM</button>
        <p>Current Score: {cs}</p>
        {markerFlag &&
          <div className='continue'>
            <p>You missed by: {getdistance()} km</p>
            <button className='confirm' onClick={nextround} disabled={round === 5 && !markerFlag}>NEXT TURN</button>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
