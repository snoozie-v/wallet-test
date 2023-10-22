// eslint-disable-next-line no-unused-vars
import React from 'react'
import mino from '../assets/minomob.png'



function Header( {handleSigning}) {
  return (
    <div>
          <div className='header'>
      <div className='socials'>
        <div className='social discord'>D</div>
        <div className='social discord'>I</div>
        <div className='social x'>X</div>
      </div>
      <img className='logo' src={mino}></img>
      <button className='wallet button' onClick={handleSigning}>
        view Minos by signing
      </button>
      <div className='navMenu'>Nav</div>
    </div>
    </div>
  )
}

export default Header
