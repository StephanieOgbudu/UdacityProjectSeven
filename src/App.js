import React, { Component } from 'react';
import './App.css';
import VenueMap from './VenueMap.js';
//import MapboxGl from 'mapbox-gl';

class App extends Component {
  render() {
    return (
      <div className='app'>
        <VenueMap/>
      </div>
    );
  }
}

export default App;
