// eslint-disable-next-line no-unused-vars
import React from 'react'
import mino from '../assets/minomob.png'
import discord from '../assets/discord.png'
import insta from '../assets/insta.png'
import xxx from '../assets/xxx.png'
import connect from '../assets/connect.png'

function Header( {handleSigning}) {
  return (
    <div>
          <div className='header'>
      <div className='socials'>
        <div className='social discord'><img src={discord}></img></div>
        <div className='social discord'><img src={insta}></img></div>
        <div className='social x'><img src={xxx}></img></div>
      </div>
      <img className='logo' src={mino}></img>
      <button className='wallet button' onClick={handleSigning}>
        <img src={connect} alt="connect to wallet"/>
      </button>
      <div className='navMenu'>Nav</div>
    </div>
    </div>
  )
}

export default Header
