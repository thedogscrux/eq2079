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
        {/*<h1>Welcome {this.state.user.name}</h1>
        }<Link to='/login#sci'>Signup/Login</Link>*/}

        <div className={'ans-show-wrapper intro' + ((this.state.ans.intro) ? 'play' : '')}>
          <div className='welcome-hero'>
            <div className='hero-planet'></div>
            <div className='hero-ship'></div>
            <div className='hero-human'></div>
          </div>
          <div className='intro-block'>
            <div className='ans show-1 intro-copy' style={{ opactiy: 0 }}>Come&nbsp;in.. Come&nbsp;in...</div>
            <div className='ans show-2 intro-copy'>
              This is Mission&nbsp;Kontrol<br/>Can you hear us?
            </div>
            <div className='ans show-3 intro-copy'>
              <button className='-white-metal -spaced-copy' onClick={() => this.setState({ ans: {intro: true, main: true} })}>ACCEPT TRANSMISSION</button>
            </div>
          </div>
        </div>

        <div className={'ans-show-wrapper main ' + ((this.state.ans.main) ? 'play' : 'hide')}>
          <div className='ans show-1 intro-copy'>We are sorry to inform you.</div>
          <div className='ans show-2 intro-copy -white'>But humans are under attack.</div>
          <div className='ans show-3 intro-copy'>From an Artificial Intelligence</div>
          <div className='ans show-4 intro-copy -white'>We don&#39;t have much time to explain.</div>
          <div className='ans show-5 intro-copy'>We are building rockets to get as many humans off the planet as possible. </div>
          <br />
          <div className='ans show-6 intro-copy -white-metal -spaced-copy -center'>We need</div>
          <div className='ans show-6 intro-copy -white-metal -spaced-copy -center'>scientists and engineers</div>
          <div className='ans show-6 intro-copy -white-metal -spaced-copy -center'>Will you help&nbsp;us?</div>
          <div className='ans show-7'>
            <div className='team-block'>
              <div className='team-tile'>
                <div className='team-title'>
                  <Link to='/login#scientist'>scientists</Link>
                </div>
              </div>
            </div>
            <div className='team-block'>
              <div className='team-tile'>
                <div className='team-title'>
                  <Link to='/login#engineer'>engineers</Link>
                </div>
              </div>
            </div>
            <div className='optOut'>
              <Link to='https://developers.giphy.com/docs/'>no, goodluck</Link>
            </div>
          </div>
          <div className='welcome-lower'>
            <div className='lower-city'></div>
            <div className='lower-launch'></div>
            <div className='lower-people'></div>
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
