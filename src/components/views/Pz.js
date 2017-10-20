import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Pz extends Component {
  render(){
    return(
      <div>
        <h1>Pz</h1>
        <Link to='/pzstart'>Pz Start</Link>
      </div>
    )
  }
}

export default Pz
