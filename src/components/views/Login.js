import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import Cookies from 'js-cookie'

import Auth from '../Auth'

class Login extends Component {
  constructor(props){
    super(props)
    this.state = {
      job: this.validateJob(window.location.hash.substr(1)),
      returningUser: Cookies.get('eq2079')
    }
  }

  validateJob(job) {
    if(!job) {
      return null
    } else if(job === 'scientist' || job === 'engineer') {
      return job
    } else {
      return 'grunt'
    }
  }

  getCookieJob() {

  }

  render(){
    // Redirect TODO: move all this to User Component?
    if(!this.state.job && !this.state.returningUser) {
      return (
        <Redirect to='welcome'/>
      )
    }
    let content = ''
    if(this.state.job) {
      content = <div>
        <h2>Great! We need more {this.state.job}&apos;s</h2>
        <p>First things first.  We need you to enter a code name and secret pin.</p>
      </div>
    } else {
      content = <div>
        <h2>Good to see you again.</h2>
        <p>What's your secret code {this.state.returningUser}?</p>
      </div>
    }
    return(
      <div>
        <h1>Signup/Login</h1>
        {content}
        <Auth display='formLogin' />
      </div>
    )
  }
}

export default Login
