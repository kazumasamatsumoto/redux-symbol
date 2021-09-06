import { VFC } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AccountCreate } from './components/AccountCreate'
import { ConfirmMultisigTransaction } from './components/ConfirmMultisigTransaction'
import { Layout } from './components/Layout'
import { SendMultisigTransaction } from './components/SendMultisigTransaction'
import { SendTransaction } from './components/SendTransaction'

const App: VFC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/">
            <AccountCreate />
          </Route>
          <Route exact path="/send-transaction">
            <SendTransaction />
          </Route>
          <Route exact path="/send-multisig-transaction">
            <SendMultisigTransaction />
          </Route>
          <Route exact path="/confirm-multisig-transaction">
            <ConfirmMultisigTransaction />
          </Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  )
}

export default App
