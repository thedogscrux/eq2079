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
      <div id='component-nav'>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/">Root</Link>
        <Link to="/welcome">Welcome</Link>
        <Link to="/login">Login</Link>
        <Link to="/start">Start</Link>
        <br/>
        <Link to="/dashboard">Dashboard</Link>
        <Link to='/pzs'>Pzs</Link>
        <Link to='/pzs/pz1'>Pz 1 (pipes)</Link>
        <Link to='/pzs/pz2'>Pz 2 (jigsaw)</Link>
        <Link to='/pzs/pz3'>Pz 3 (soduko)</Link>
        <Link to='/pzs/pz4'>Pz 4 (shape)</Link>
        <Link to='/pzs/pz5'>Pz 5 (spots)</Link>
        <Link to='/pzs/pz6'>Pz 6 (volume)</Link>
        <Link to='/pzs/pz7'>Pz 7 (arm)</Link>
        <Link to='/pzs/pz8'>Pz 8 (freq)</Link>
        <Link to='/pzs/pz9'>Pz 9 (switch)</Link>
        <Link to='/pzs/pz10'>Pz 10 (code)</Link>
        <br/>
        <Link to="/mk">Mission Kontrol</Link>
        <Link to="/projector">Projector</Link>
      </div>
    )
  }
}

export default Nav
