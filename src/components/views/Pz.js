import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Pz extends Component {
  render(){
    return(
      <div>
        Pz<br/>
        <Link to="/pzstart">Pz Start</Link>
      </div>
    )
  }
}

export default Pz
