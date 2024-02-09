"use client"

import { useEffect, useState } from "react"
import { FaSpinner } from "./Icons"

/**
 * header component for the entire application
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const Header = ({ reader }: { reader: any }) => {
  const [terminalStatus, setTerminalStatus] = useState<"offline" | "online">(
    "offline"
  )
  const [terminalLabel, setTerminalLabel] = useState<any>("")
  const [isLoading, setIsLoading] = useState<any>(false)

  useEffect(() => {
    setIsLoading(true)
    setTerminalStatus(reader.status)
    setTerminalLabel(reader.label)
    setIsLoading(false)
  }, [reader])

  return (
    <header className='bg-gray-900 border-b border-gray-200 sticky top-0 z-[50]'>
      {!isLoading ? (
        <nav
          className='mx-auto flex max-w-7xl items-center justify-center p-4 lg:px-20'
          aria-label='Global'>
          <div className='flex flex-col md:flex-row space-x-2 items-center'>
            <p className='text-xs font-medium leading-6 text-white uppercase border rounded-full p-1'>
              terminal: {terminalLabel}
            </p>
            <p className='font-semibold leading-6 text-white uppercase'>
              {terminalStatus}
            </p>
            <div
              className={`h-4 w-4 text-white ${
                terminalStatus === "online"
                  ? "bg-green-500 shadow-green-500 animate-pulse"
                  : "bg-red-500 shadow-red-500"
              } rounded-full shadow-2xl`}></div>
          </div>
        </nav>
      ) : (
        <FaSpinner className='animate-spin' />
      )}
    </header>
  )
}

export default Header
