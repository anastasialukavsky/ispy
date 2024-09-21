import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Logo = () =>{
  const navigate = useNavigate()
  const handleLogoClick = () => {
    navigate('/')
  }
  return (
    <div className='block h-20 w-20'>
      <img src="public/assets/loggo.png" alt="" onClick={handleLogoClick}/>
    </div>
  )
}
