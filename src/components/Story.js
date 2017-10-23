import React, { Component } from 'react'

import { staticStory } from '../data/static.js'

class Story extends Component {

  render(){
    return(
      <div className='component-wrapper'>
        <h2>Story</h2>
        Chapter 1/10<br/>
        {staticStory[0]}
      </div>
    )
  }
}

export default Story
