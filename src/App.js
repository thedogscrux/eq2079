import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import Nav from './components/Nav'

import Welcome from './components/views/Welcome'
import Login from './components/views/Login'
import Start from './components/views/Start'

import Dashboard from './components/views/Dashboard'
import Pz from './components/views/Pz'
import PzStart from './components/views/Pz/PzStart'

import MK from './components/views/MK'

import './styles/main.css';

const App = () => (
  <Router>
    <div>
      <Nav />
      <hr/>

      <Route path="/welcome" component={Welcome}/>
      <Route path="/login" component={Login}/>
      <Route path="/start" component={Start}/>

      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/pz" component={Pz}/>
      <Route path="/pzstart" component={PzStart}/>

      <Route path="/mk" component={MK}/>
    </div>
  </Router>
)


export default App
