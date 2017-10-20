import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Login extends Component {
  render(){
    return(
      <div>
        <h1>Signup/Login</h1>
        <input type='text' placeholder='Code Name' />
        <input type='password' placeholder='Secret Pin' />
        <Link to='./start'>Start</Link>
      </div>
    )
  }
}

export default Login
