import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import PrivateRoute from './components/PrivateRoute'

import Alert from './components/Alert'
import User from './components/User'
import Auth from './components/Auth'
import Nav from './components/Nav'
import InactiveUser from './components/views/InactiveUser'

import Welcome from './components/views/Welcome'
import Login from './components/views/Login'
import Start from './components/views/Start'

import Dashboard from './components/views/Dashboard'
import Pzs from './components/views/Pzs'

import MK from './components/views/MK'
import Projector from './components/views/Projector'

//import './styles/clean.css';
import './styles/eq2079.css';

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'
import firebaseConfig from './config/firebase.config.json'

firebase.initializeApp(firebaseConfig)

const App = () => (
  <Router>
    <div>
      <InactiveUser />

      <Alert />

      <User />
      <Auth display='userInfo'/>
      <Nav />

      <Route path="/" component={Welcome}/>
      <Route path="/login" component={Login}/>
      <PrivateRoute path="/start" component={Start}/>

      <PrivateRoute path="/dashboard" component={Dashboard}/>
      <PrivateRoute path='/pzs' component={Pzs}/>

      <Route path="/mk" component={MK}/>
      <Route path="/projector" component={Projector}/>
    </div>
  </Router>
)

export default App
