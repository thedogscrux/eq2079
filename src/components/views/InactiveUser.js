import React, { Component } from 'react'
import { connect } from 'react-redux'

const mapStateToProps = (state, props) => {
  return {
    user: state.user
  }
}

class InactiveUser extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: this.props.user
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
    let content = null
    if(this.state.user.status == 'inactive') {
      content = <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            left: '0',
            bottom: '0',
            backgroundColor: 'rgba(255, 0, 0, .4)',
            color: '#ffffff'
          }}
        >
          <h1>Inactive User</h1>
        </div>
    }
    return(
      <div id='component-inactive-user'>
        {content}
      </div>
    )
  }
}

const InactiveUserContainer = connect(
  mapStateToProps
)(InactiveUser)

export default InactiveUserContainer
