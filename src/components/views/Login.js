import React, { Component } from 'react'

import Auth from '../Auth'

class Login extends Component {
  render(){
    return(
      <div>
        <h1>Signup/Login</h1>
        <Auth display='formLogin' />
      </div>
    )
  }
}

export default Login
