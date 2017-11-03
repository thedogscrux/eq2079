import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Start extends Component {
  render(){
    return(
      <div>
        <h1>Start</h1>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <Link to='./dashboard'>Ready to start?</Link>
      </div>
    )
  }
}

export default Start
