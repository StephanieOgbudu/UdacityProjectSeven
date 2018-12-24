import React, { Component } from 'react'

class Search extends Component{
	constructor(props){
		super(props)
		this.state = {
			searchInfo:''
		}
	}
	changeHandler = event =>{
		this.setState({ searchInfo: event.target.value });
	};
	render(){
		return(
			<div>
				<form 
				onSubmit={this.props.getVenues.bind(null, this.state.searchInfo)}>
				<input 
					type='text' 
					aria-label='Search Place'
					placeholder='Search place' 
					name='searchInfo' 
					id='searchInfo' 
					onChange={this.changeHandler} 
					className='form-control col-md-6'
				/>
				<div className='input-group-append'>
					<button 
					type='submit'
					className='btn btn-dark' 
					>Search</button>
				</div>
				</form>
			</div>
			)
	}
}

export default Search;