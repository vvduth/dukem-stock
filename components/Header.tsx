import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import NavItems from './NavItems'
import UserDropDown from './UserDropDown'
import { searchStocks } from '@/lib/actions/finnhub.actions'

const Header = async ({user}: {user: User}) => {

  const initialStocks = await searchStocks()
  return (
    <header className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href={"/"}>
            <Image src={"/assets/icons/logo.svg"} alt="Logo" width={120} height={40} 
            className='h-8 w-auto cursor-pointer'
            />
            </Link>
            <nav className='hidden sm:block'>
                {/* navitems */}
                <NavItems initialStocks={initialStocks} />
            </nav>
            {/* use dropdown for mobile */}
            <UserDropDown user={user} initialStocks={initialStocks} />
        </div>
    </header>
  )
}

export default Header
