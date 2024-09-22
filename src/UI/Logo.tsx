import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Logo = () =>{
  const navigate = useNavigate()
  const handleLogoClick = () => {
    navigate('/')
  }
  return (
    <div className='block w-14'>
      <img src="public/assets/logggo.png" alt="" onClick={handleLogoClick}/>
    </div>
  )
}
