import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import Pz from './Pz/Pz'

class Pzs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pzId: 'this.props.match.params.pzId',
      checkPzId: ''
    }
    this.handleChangeCheckPzId = this.handleChangeCheckPzId.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzId: 'nextProps.match.params.pzId'
      });
    }
  }

  handleChangeCheckPzId(event) {
    this.setState({ checkPzId: event.target.value })
  }

  checkIfPzExists(pzId) {
    this.props.history.push('pzs/' + pzId)
  }

  render(){
    return(
      <div>
        <Route path={`${this.props.match.url}/:pzId`} component={Pz}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <h1>Pzs</h1>
            <input type='text' placeholder='Puzzle Code' value={this.state.checkPzId} onChange={this.handleChangeCheckPzId} />
            <button onClick={() => this.checkIfPzExists(this.state.checkPzId)}>Check Code</button>
          </div>
        )}/>
      </div>
    )
  }
}

export default Pzs
