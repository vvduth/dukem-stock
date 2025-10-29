"use client"
import Link from 'next/link'
import React from 'react'
import { NAV_ITEMS } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import SearchCommand from './SearchCommand'
const NavItems = () => {

    const pathName = usePathname();
    const isActive = (path: string) => {
        if (path === '/') {
            return pathName === '/';
        }
        return pathName.startsWith(path);
    }
    return (
        <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium'>
            {NAV_ITEMS.map((item) => {

                if (item.label === "Search") {
                    return (
                        <li key={"search-trigger"}>
                            <SearchCommand 
                                renderAs="text"
                                label="Search"
                                initialStocks ={[{
                                    symbol: "AAPL",
                                    name: "Apple Inc.",
                                    exchange: "NASDAQ",
                                    type: "Common Stock",
                                    isInWatchlist: false
                                }]}
                            />
                        </li>
                    )
                }
                return (
                    (
                <li key={item.href}>
                    <Link href={item.href}
                        className={`hover:text-yellow-500 transition-colors 
                            ${isActive(item.href) ? 'text-gray-100' : ''}`}
                    >
                        {item.label}
                    </Link>
                </li>
            )
                )
            })}
        </ul>
    )
}

export default NavItems
