import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Welcome extends Component {
  render(){
    return(
      <div>
        <h1>Welcome</h1>
        <Link to='/login'>Signup/Login</Link>
      </div>
    )
  }
}

export default Welcome
