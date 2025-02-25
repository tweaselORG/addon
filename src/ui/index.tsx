import { render } from 'preact';
import { Route, Router, Switch } from 'wouter-preact';
import { useHashLocation } from 'wouter-preact/use-hash-location';
import { Analysis } from './pages/Analysis';
import { Complain } from './pages/Complain';
import { EvaluateResponse } from './pages/EvaluateResponse';
import { Home } from './pages/Home';
import { SendNotice } from './pages/SendNotice';

const Ui = () => (
    <>
        <Router hook={useHashLocation}>
            <Switch>
                <Route path="/">
                    <Home />
                </Route>

                <Route path="/analysis/:reference">{(params) => <Analysis reference={params.reference} />}</Route>
                <Route path="/send-notice/:reference">{(params) => <SendNotice reference={params.reference} />}</Route>
                <Route path="/evaluate-response/:reference">
                    {(params) => <EvaluateResponse reference={params.reference} />}
                </Route>
                <Route path="/complain/:reference">{(params) => <Complain reference={params.reference} />}</Route>
            </Switch>
        </Router>
    </>
);

const main = document.getElementById('main');
if (main) render(<Ui />, main);
