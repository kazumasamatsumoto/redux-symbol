import { VFC } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Layout } from "./components/Layout";

const App: VFC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/fetch-a"></Route>
          <Route exact path="/fetch-b"></Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
