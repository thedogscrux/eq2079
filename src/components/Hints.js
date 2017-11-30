import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import game from '../Settings.js'
import Score, { calcMaxScore, calcHintCost } from '../utils/Score.js'

class Hints extends Component {
  constructor(props){
    super(props)
  }

  showHints() {
    let hintsPopup = document.getElementById('hints-popup-wrapper')
    //document.getElementById('show-hints-btn').disabled = true
    hintsPopup.style.display = 'block'
    // hintsPopup.classList.add('ans-fade-in')
    // let timer = setTimeout(() => {
    //   hintsPopup.className = ''
    //   hintsPopup.style.display = 'block'
    //   document.getElementById('show-hints-btn').disabled = false
    // }, 3000)
  }

  hideHints() {
    let hintsPopup = document.getElementById('hints-popup-wrapper')
    //document.getElementById('hide-hints-btn').disabled = true
    hintsPopup.style.display = 'none'
    // hintsPopup.classList.add('ans-fade-out')
    // let timer = setTimeout(() => {
    //   hintsPopup.className = ''
    //   hintsPopup.style.display = 'none'
    //   document.getElementById('show-hints-btn').disabled = false
    // }, 5000)
  }

  render() {
    let hintAttempts = game.hints.allowAfterPzAttempts - this.props.userAttempts
    let hintDisabled = (hintAttempts > 0) ? 'disabled' : ''

    let htmlShowHintsButtonText = (this.props.hintsCount < this.props.hints.length) ? 'Hint' : 'Hints'
    // let htmlShowHintsButton = (this.props.hintsCount < this.props.hints.length) ? <button onClick={() => this.props.getHint()} disabled={hintDisabled}>Get Hint{(hintDisabled)?' After '+ hintAttempts +' more attempt(s)':''}</button> : ''
    //let htmlShowHintsButton = <button id='show-hints-btn' onClick={() => this.showHints()} disabled={hintDisabled}>{htmlShowHintsButtonText}</button>
    let htmlShowHintsButton = <button id='show-hints-btn' onClick={() => this.showHints()}>{htmlShowHintsButtonText}</button>

    // show hints only after first attempt
    let htmlHints = ''
    let htmlHintButton = ''
    if(!hintDisabled) {
      htmlHints = this.props.hints.map( (hint, key) => {
        // show the hint button for first hint, then second
        if (key > this.props.hintsCount) {
          return(<div key={key}></div>)
        } else if (key === this.props.hintsCount) {
          return(
            <div key={key}>
              <button onClick={() => this.props.getHint()}>Show {(key === 0) ? 'First' : 'Second'} Hint</button>
            </div>
          )
        }
        // show
        // if(this.props.userAttempts >= 1 && this.props.hintsCount <= this.props.hints.length) this.props.getHint()

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
    } else {
      htmlHints = 'hints available after your first attempt.'
    }

    let htmlPopup =
      <div id='hints-popup-wrapper' className='' style={{ display: 'none' }}>
        <div id='hints-popup'>
          {htmlHints}
          <button id='hide-hints-btn' onClick={() => this.hideHints()}>Close</button>
        </div>
      </div>

    return (
      <div id='component-hints'>
        {htmlShowHintsButton}
        {htmlPopup}
      </div>
    )
  }
}

export default Hints
