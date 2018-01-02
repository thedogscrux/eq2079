import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import { showAlert } from './Alert'

import { propsPzs } from '../data/propsPzs'

class CheckPzCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pzCode: 'this.props.match.params.pzCode',
      checkPzCode: ''
    }
    this.handleChangeCheckPzCode = this.handleChangeCheckPzCode.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzCode: 'nextProps.match.params.pzCode'
      });
    }
  }

  handleChangeCheckPzCode(event) {
    this.setState({ checkPzCode: event.target.value })
  }

  checkIfPzExists(pzCode) {
    let pzExists = propsPzs.filter( pz => pz.code.toLowerCase() === pzCode.toLowerCase())
    if (pzCode.toLowerCase() === '1gl') pzCode = '1gl'
    if (pzExists.length >= 1 || pzCode === '1gl') {
      if (pzCode === '1gl') pzCode = 'onegl'
      this.props.history.push('pzs/' + pzCode.toLowerCase())
    } else {
      showAlert('Invalid Code', 'error')
    }
  }

  render(){
    return(
      <div id='component-check-pz-code' className='component-wrapper'>
        <input type='text' placeholder='Puzzle Code' value={this.state.checkPzCode} onChange={this.handleChangeCheckPzCode} maxLength={7} />
        <button onClick={() => this.checkIfPzExists(this.state.checkPzCode)}>Check Code</button>
      </div>
    )
  }
}

export default CheckPzCode
