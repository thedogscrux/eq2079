import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Link, Redirect } from 'react-router-dom'

import Cookies from 'js-cookie'

const mapStateToProps = (state, props) => {
  return {
    user: state.user
  }
}

class Welcome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      ans: {
        intro: true,
        main: false
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        user: nextProps.user
      })
    }
  }

  render(){
    // Redirect TODO: move all this to User Component?
    if (Cookies.get('eq2079') && (this.props.location.pathname.indexOf('welcome') === 1 || this.props.location.pathname === '/')) {
      return <Redirect to='login'/>
    } else if (this.props.location.pathname === '/') {
      return <Redirect to='welcome'/>
    } else if (this.state.user.hasOwnProperty('name') || this.props.location.pathname.indexOf('welcome') === -1) {
      return <div></div>
    }
    return(
      <div id='component-welcome'>
        <h1>Welcome {this.state.user.name}</h1>
        <Link to='/login#sci'>Signup/Login</Link>

        <div className={'ans-show-wrapper intro ' + ((this.state.ans.intro) ? 'play' : '')}>
          <div className='ans show-1' style={{ opactiy: 0 }}>Come in.. Come in...</div>
          <div className='ans show-2'>
            This is Mission Kontrol<br/>Can you hear us?
          </div>
          <div className='ans show-3'>
            <button onClick={() => this.setState({ ans: {intro: true, main: true} })}>Yes</button>
          </div>
        </div>

        <div className={'ans-show-wrapper main ' + ((this.state.ans.main) ? 'play' : 'hide')}>
          <div className='ans show-1'>We are sorry to inform you.</div>
          <div className='ans show-2'>But humans are under attack.</div>
          <div className='ans show-3'>From an Artificial Intelligence</div>
          <div className='ans show-4'>We don’t have much time to explain.</div>
          <div className='ans show-5'>We are building rockets to get as many humans off the planet as possible. </div>
          <div className='ans show-6'>We need scientists and engineers.<br/>Will you help us?</div>
          <div className='ans show-7'>
            <Link to='/login#scientist'>Yes, make me a scientist</Link>
            <Link to='/login#engineer'>Yes, make me an engineer</Link>
            <Link to='https://developers.giphy.com/docs/'>No, goodluck</Link>
          </div>
        </div>

      </div>
    )
  }
}

const WelcomeContainer = connect(
  mapStateToProps
)(Welcome)

export default WelcomeContainer
