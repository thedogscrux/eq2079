import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Start extends Component {
  render(){
    return(
      <div id='component-start'>
        <h1>Instructions</h1>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <Link to='./dashboard'>Ready to start?</Link>
      </div>
    )
  }
}

export default Start
