import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

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
    if (pzExists.length >= 1) {
      this.props.history.push('pzs/' + pzCode.toLowerCase())
    } else {
      alert('Invalid Code')
      console.log('Pz doesnt exists.')
    }
  }

  render(){
    return(
      <div id='component-check-pz-code' className='component-wrapper'>
        <input type='text' placeholder='Puzzle Code' value={this.state.checkPzCode} onChange={this.handleChangeCheckPzCode} />
        <button onClick={() => this.checkIfPzExists(this.state.checkPzCode)}>Check Code</button>
      </div>
    )
  }
}

export default CheckPzCode
