// import styles for the entire application
import "./globals.scss"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CookiesProvider } from "lib/context/CookiContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BBPOS Wise App",
}

/**
 * Main layout/shell of the entire application
 *
 * @components
 * @returns {JSX.Element} The rendered React component.
 */
const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  return (
    <html lang='en'>
      <CookiesProvider>
        <body className={inter.className}>{children}</body>
      </CookiesProvider>
    </html>
  )
}

export default RootLayout
