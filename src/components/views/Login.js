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
      content = <div class="team-gate-wrapper">
        <h2 class="-white-metal">Great! We need more {this.state.job}s</h2>
        <p>enter a code name and secret&nbsp;pin.</p>
      </div>
    } else {
      content = <div class="team-gate-wrapper">
        <h2 class="-white-metal">Welcome Back</h2>
        <p>What&#39;s your secret code {this.state.returningUser}?</p>
      </div>
    }
    return(
      <div id='component-login'>
        {content}
        <Auth display='formLogin' />
        <div class="team-image -engineer"></div>
      </div>
    )
  }
}

export default Login
