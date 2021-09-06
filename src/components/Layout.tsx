import { ReactNode, VFC } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

export const Layout: VFC<Props> = ({ children }) => {
  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono">
      <header>
        <nav className="bg-gray-800 w-screen">
          <div className="flex items-center pl-8 h-14">
            <div className="flex space-x-4">
              <Link
                className="text-sm text-gray-300 hover:bg-gray-700 px-3 py-2 rounded"
                to="/"
              >
                Account Create
              </Link>
              <Link
                className="text-sm text-gray-300 hover:bg-gray-700 px-3 py-2 rounded"
                to="/send-transaction"
              >
                Send Transaction
              </Link>
              <Link
                className="text-sm text-gray-300 hover:bg-gray-700 px-3 py-2 rounded"
                to="/send-multisig-transaction"
              >
                Send MultisigTransaction
              </Link>
              <Link
                className="text-sm text-gray-300 hover:bg-gray-700 px-3 py-2 rounded"
                to="/confirm-multisig-transaction"
              >
                Confirm MultisigTransaction
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col justify-center items-center w-screen">
        {children}
      </main>
    </div>
  )
}
