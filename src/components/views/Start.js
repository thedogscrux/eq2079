import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Start extends Component {
  render(){
    return(
      <div>
        <h1>Start</h1>
        <Link to='./dashboard'>Dashboard</Link>
      </div>
    )
  }
}

export default Start
