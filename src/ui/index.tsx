import { render } from 'preact';
import { Route, Router, Switch } from 'wouter-preact';
import { useHashLocation } from 'wouter-preact/use-hash-location';
import { Analysis } from './pages/Analysis';
import { Home } from './pages/Home';

const Ui = () => (
    <>
        <Router hook={useHashLocation}>
            <Switch>
                <Route path="/">
                    <Home />
                </Route>

                <Route path="/analysis/:reference">{(params) => <Analysis reference={params.reference} />}</Route>
            </Switch>
        </Router>
    </>
);

const main = document.getElementById('main');
if (main) render(<Ui />, main);
