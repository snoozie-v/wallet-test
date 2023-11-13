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
        <div className='social insta'><img src={insta}></img></div>
        <div className='social x'><img src={xxx}></img></div>
      </div>
      <img className='logo' src={mino}></img>
      <div className='wallet' onClick={handleSigning}>
        <img src={connect} alt="connect to wallet"/>
      </div>

    </div>
    <h1 className='image-h1'>View Minos</h1>
    </div>
  )
}

export default Header
