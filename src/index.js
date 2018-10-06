import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from 'aws-amplify'

import App from './App';
import * as serviceWorker from './serviceWorker';
import './styles.sass'
import configuration from './aws-exports'

Amplify.configure(configuration)

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
