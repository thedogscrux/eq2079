import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Link, Redirect } from 'react-router-dom'

const mapStateToProps = (state, props) => {
  return {
    userName: state.user.name
  }
}

class Start extends Component {

  render(){
    return(
      <div id='component-start'>
        <h1>Instructions</h1>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <p>Instructions on how to play</p>
        <Link to='./dashboard'>Ready to start?</Link>
      </div>
    )
  }
}

const StartContainer = connect(
  mapStateToProps
)(Start)

export default Start
