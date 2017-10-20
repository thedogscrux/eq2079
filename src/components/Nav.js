import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import {browserHistory, hashHistory} from 'react-router';

class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render(){
    return(
      <div id='nav'>
        <Link to="/">Root</Link>
        <Link to="/welcome">Welcome</Link>
        <Link to="/login">Login</Link>
        <Link to="/start">Start</Link>
        -------
        <Link to="/dashboard">Dashboard</Link>
        <Link to='/pzs'>Pzs</Link>
        <Link to='/pzs/pz1'>Pz One</Link>
        <Link to='/pzs/pz2'>Pz Two</Link>
        <Link to='/pzs/pz3'>Pz Three</Link>
        -------
        <Link to="/mk">Mission Kontrol</Link>
        <Link to="/projector">Projector</Link>
      </div>
    )
  }
}

export default Nav
