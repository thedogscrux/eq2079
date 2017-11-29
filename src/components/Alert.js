import React, { Component } from 'react'

class Alert extends Component {

  // FUNCS

  showAlert(msg, type = 'default') {
    let alert =  document.getElementById('component-alert')
    alert.innerHTML = msg
    alert.className = type + ' ans-alert-fade-out'
    alert.style.display = 'block'

    let timer = setTimeout(() => {
      let alert =  document.getElementById('component-alert')
      alert.className = ''
      alert.style.display = 'none'
    }, 6000)
  }

  render() {
    return (
      <div id='component-alert' className='default'></div>
    )
  }
}

export const showAlert = Alert.prototype.showAlert

export default Alert
