import './globals.css'
import 'github-fork-ribbon-css/gh-fork-ribbon.css'
import { Inter } from 'next/font/google'

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: '%s – Buzzonk',
    default: 'Buzzonk – Online Multiplayer Buzzer',
  },
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a class="github-fork-ribbon right-top fixed" href="https://github.com/a4smanjorg5/buzzonk#readme" data-ribbon="Fork me on GitHub" target="developer" title="Fork me on GitHub">&nbsp;</a>
        <a class="github-fork-ribbon left-bottom fixed" href="https://replit.com/@givent/buzzonk" target="developer" data-ribbon="FORK ME">&nbsp;</a>
        {children}
      </body>
    </html>
  )
}
