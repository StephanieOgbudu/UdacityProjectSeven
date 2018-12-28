import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Debounce } from 'react-throttle';

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
			currentMarker: null,
			markers: [],
			shownMarkers: [],
			searchInfo:'',
			message: false
		}
	}

	componentDidMount(){
		//get current location on the map
		this.getLocation();
		fetch('https://api.mapbox.com/v4/mapbox.mapbox-streets-v7/tilequery/3.406448,6.465422.json?limit=5&access_token=pk.eyJ1Ijoic3RlcGhhbmllb2didWR1IiwiYSI6ImNqbzRwOWo4ejE2Y3UzcW54dmkxcGptYngifQ.7Kpon4dtexQwZ3epzWiNiw')
		.then(data => this.setState({ data }))
		.catch(error => this.setState({ error: 'Failed API connection', isLoading: false }));
		//retrieve access token and map styling requirements
		mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlcGhhbmllb2didWR1IiwiYSI6ImNqbzRwOWo4ejE2Y3UzcW54dmkxcGptYngifQ.7Kpon4dtexQwZ3epzWiNiw';
		this.map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: [3.4141327, 6.4299843],
			zoom: 15,
			interactive:true
		});
		//add geocoder 
		this.map.addControl(new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			country: 'ng'
		}));
		this.setState({isLoading: true});
		this.map.addControl(new mapboxgl.NavigationControl());
		this.map.on('load', ()=>{
			this.addMarkers();
		});
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
				this.getVenues('places')
			});
		});
	};

	//retrieve venues nearest to the current location
	getVenues=(query)=>{
		const endPoint = 'https://api.foursquare.com/v2/venues/explore?';
		const params = {
			client_id: '5M5IZS41H11QH2PY05HO5UYLHTZO05ILAQHHFSOGRP0L4BMP',
			client_secret: 'CLAHULGED50LQ0DX3L4JWXDGLFRBZAYXRNXPK5NSW5IENJ2Y',
			ll: this.state.latlong,
			query: 'food',
			near: 'Lagos, Nigeria',
			v: 20182212
		};
		axios.get(endPoint+ new URLSearchParams(params)).then(response=>{
			this.setState({venues:response.data.response.groups[0].items})
		}).catch(function(error){
			alert('Error in Connection: Data cannot be retrieved.')
		})
	}

	//add markers to the map
	addMarkers=()=>{
		const allMarkers = this.state.venues
			.map(venue=>{
				const popup = new mapboxgl.Popup({
					className: `${[venue.venue.location.lng, venue.venue.location.lat]}`,
					offset: 25
				})
				.setLngLat([venue.venue.location.lng, venue.venue.location.lat])
				.setHTML(
					`<h3>${venue.venue.name}</h3>
					<p>${venue.venue.location.formattedAddress}</p>`
					)
				let marker = new mapboxgl.Marker({
					color: this.state.color,
					className: venue.venue.name
				})
				.setLngLat([venue.venue.location.lng, venue.venue.location.lat])
        .setPopup(popup)
        .addTo(this.map)
        marker.getElement().data = venue.venue.name;
        marker.getElement().classList.add("animated")
        marker.getElement().addEventListener('click', this.manageMarker)
        return marker;
			})
			this.setState({ markers: allMarkers, shownMarkers: allMarkers })
	}

	displayMarker=()=>{
		this.props.markers.forEach(marker => marker.remove());
		this.props.shownMarkers.forEach(marker =>
		{
			marker.addTo(this.map)
		})
	}
	//monitor click activity
	manageMarker=(e)=>{
		e.preventDefault();
	}

	manageClick(e){
		e.preventDefault();
		var markarray = this.state.shownMarkers
		for (var i=0; i<markarray.length; i++){
			this.state.shownMarkers[i].getPopup()
			if(this.state.showingMarkers[i].getPopup().options.className){
				const activeMarker = this.state.shownMarkers[i]
				activeMarker.getElement().classList.toggle('flash')
				activeMarker.togglePopup()
			}
			else{
				this.state.shownMarkers[i].getPopup()._onClickClose();
			}
		}
	}

	updateSearch(event){
		this.setState({searchInfo: event.target.value})
	};

	filterSearch(event){
		var filteredLocation = this.state.venues;
		filteredLocation = filteredLocation.filter((venue => {
			return venue.toLowerCase().search(
				event.target.value.toLowerCase()) !== -1;
		}));
		this.setState({
			venues: filteredLocation
		});
		if(filteredLocation === 0){
			this.setState({message: true});
		}
		else{
			this.setState({message: false});
		}
	}

	render(){
		return(
			<div className='menu'>
			<div className="header">
      	<h2>Neighborhood Restaurants</h2>
      </div>
      <div className='filter-option'>
      	<center><Debounce time='200' handler='onChange'>
				<input 
					type='text' 
					aria-label='Search Restaurants'
					placeholder='Search restaurants' 
					name='searchInfo' 
					id='searchInfo'
					className='form-control col-md-9'
					onChange={this.filteredLocation}		
				/>
				</Debounce></center>
			</div>
			<ul className='venue-list'>
				{this.state.venues.map(venue=>{
					return <li key={venue.venue.id}><button key={venue.venue.name} aria-labelledby={`${venue.venue.name}`} 
									type='button'
									className={`button ${venue.venue.name}`}
									onClick={this.manageClick.bind(this)}
									data-buttoncoord={`${[venue.venue.location.lng, venue.venue.location.lat]}`}>{venue.venue.name}</button></li>
				})}
				{this.state.message ? <li>Not on the map</li> : ''}
				</ul>
			</div>
		);
	}
}

export default VenueMap;
