import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import Pz from './Pz/Pz'

class Pzs extends Component {
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
    this.props.history.push('pzs/' + pzCode)
  }

  render(){
    return(
      <div id='component-pzs' className='component-wrapper'>
        <Route path={`${this.props.match.url}/:pzCode`} component={Pz} history={this.props.history} />
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <h1>Pzs</h1>
            <input type='text' placeholder='Puzzle Code' value={this.state.checkPzCode} onChange={this.handleChangeCheckPzCode} />
            <button onClick={() => this.checkIfPzExists(this.state.checkPzCode)}>Check Code</button>
          </div>
        )}/>
      </div>
    )
  }
}

export default Pzs
