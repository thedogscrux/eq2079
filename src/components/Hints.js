import React, { Component } from 'react'

import game from '../Settings.js'

class Hints extends Component {
  constructor(props){
    super(props)
  }

  render() {
    let hintAttempts = game.hints.allowAfterPzAttempts - this.props.userAttempts
    let hintDisabled = (hintAttempts > 0) ? 'disabled' : ''
    let htmlHintButton = (this.props.hintsCount < this.props.hints.length) ? <button onClick={() => this.props.getHint()} disabled={hintDisabled}>Get Hint{(hintDisabled)?' After '+ hintAttempts +' more attempt(s)':''}</button> : ''
    let htmlHints = this.props.hints.map( (hint, key) => {
      // show the hint if its index is LESS than the user hint count
      if (key >= this.props.hintsCount) return(<div key={key}></div>)
      return (
        <div key={key} className='hint'>
          <h3>{hint.title}</h3>
          <p>
            {(hint.subTitle) ? <strong>{hint.subTitle}<br/></strong> : ''}
            {hint.body}
          </p>
        </div>
      )
    })

    return (
      <div id='component-hints'>
        {htmlHintButton}
        {htmlHints}
      </div>
    )
  }
}

export default Hints
