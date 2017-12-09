import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

class Start extends Component {
  render(){
    return(
      <div id='component-start'>
        <h1 class='-white-metal'>Instructions</h1>
        <p>Can you give me an estimate on repairing the dilithium matrix?<br/><br/>How does 72 hours sound?<br/><br/>Like 24 hours too long.<br/><br/>Your appeal to my humanity is pointless.</p>
        <Link to='./dashboard'>Ready to start?</Link>
        <div class="start-hero"></div>
      </div>
    )
  }
}

export default Start
