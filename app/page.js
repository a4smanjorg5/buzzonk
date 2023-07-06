import Link from 'next/link'

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Link href="/host" className="block underline">Create host</Link>
    </main>
  )
}
