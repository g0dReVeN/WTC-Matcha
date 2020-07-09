import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import Route from './routes/Route';
import routes from './routes/RouteConfig'
import './App.css';

export default class App extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    {routes.map(({ path, component: C, fetchInitialData, auth }, index) => (
                        <Route
                            exact path={ path }
                            render={ (props) => <C { ...props } fetchInitialData={ fetchInitialData } /> }
                            auth={ auth }
                            key={ index }
                        />
                    ))}
                </Switch>
            </Router>
        );
    };
};