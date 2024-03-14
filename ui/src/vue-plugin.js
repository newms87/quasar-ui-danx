export * from './helpers';
export * from './components';

import packageJson from '../package.json';

const { version } = packageJson;

function install(app) {
    console.log(`Installing Danx UI ${version}... Nothing to do really.`);
}

export {
    version,
    install
};
