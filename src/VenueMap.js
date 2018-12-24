import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import Search from './Search.js'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

class VenueMap extends Component{
	constructor(props){
		super(props)
		this.state = {
			latlong:'',
			venues:[],
			color: 'purple',
			isClicked: false,
			visibility: 'hidden',
			isLoading: true,
			error: null,
			allmarkers: [],
			markers: [],
			shownMarkers: []
		}
	}

	componentDidMount(){
		//get current location on the map
		this.getLocation();
		fetch('https://api.mapbox.com/v4/mapbox.mapbox-streets-v7/tilequery/3.406448,6.465422.json?limit=5&access_token=pk.eyJ1Ijoic3RlcGhhbmllb2didWR1IiwiYSI6ImNqbzRwOWo4ejE2Y3UzcW54dmkxcGptYngifQ.7Kpon4dtexQwZ3epzWiNiw')
		.then(data => this.setState({ data }))
		.catch(error => this.setState({ error, isLoading: false }));
		//retrieve access token and map styling requirements
		mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlcGhhbmllb2didWR1IiwiYSI6ImNqbzRwOWo4ejE2Y3UzcW54dmkxcGptYngifQ.7Kpon4dtexQwZ3epzWiNiw';
		this.map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: [3.406448, 6.465422],
			zoom: 14,
			interactive:true
		});
		//add geocoder 
		this.map.addControl(new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			country: 'ng'
		}));
		this.setState({isLoading: true});
		this.map.addControl(new mapboxgl.NavigationControl());
	}

	componentDidCatch(error, info){
		this.setState({
			error: error,
			info: info
		})
	}

	//get current location
	getLocation=()=>{
		navigator.geolocation.getCurrentPosition(response=>{
			this.setState({
				latlong: response.coords.latitude+', '+response.coords.longitude
			}, ()=>{
				this.getVenues('food')
			});
		});
	};

	//retrievve venues nearest to the current location
	getVenues=(query)=>{
		const endPoint = 'https://api.foursquare.com/v2/venues/explore?';
		const params = {
			client_id: '5M5IZS41H11QH2PY05HO5UYLHTZO05ILAQHHFSOGRP0L4BMP',
			client_secret: 'CLAHULGED50LQ0DX3L4JWXDGLFRBZAYXRNXPK5NSW5IENJ2Y',
			ll: this.state.latlong,
			query: 'top',
			v: '20182212'
		};
		axios.get(endPoint+ new URLSearchParams(params)).then(response=>{
			this.setState({venues:response.data.response.groups[0].items})
		})
	}

	//add markers to the map
	//monitor click activity
	manageClick(e){
		e.preventDefault();
	}

	render(){
		return(
			<div className='menu'>
			<div className="header">
      	<h2>Neighborhood Venues</h2>
      </div>
      <div className='filter-option'>
      	<Search getVenues={this.getVenues}/>
			</div>
			<ul className='venue-list'>
				{this.state.venues.map(venue=>{
					return <li><button aria-labelledby={`$venue.venue.name}`} 
									type='button'
									key={venue.venue.name}									className={`button ${venue.venue.name}`}
									onClick={this.manageClick.bind(this)}>{venue.venue.name}<br/>Location: {venue.venue.location.address}</button></li>
				})}
				</ul>
			</div>
		);
	}
}

export default VenueMap;