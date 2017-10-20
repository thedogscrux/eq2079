import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

class Nav extends Component {
  render(){
    return(
      <div>
        <Link to="/">Root</Link>
        <Link to="/welcome">Welcome</Link>
        <Link to="/login">Login</Link>
        <Link to="/start">Start</Link>
        -------
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pz">Pz</Link>
        -------
        <Link to="/mk">Mission Kontrol</Link>
      </div>
    )
  }
}

export default Nav
