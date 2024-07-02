export * from "./config";
export * from "./helpers";
export * from "./components";
export * from "./svg";

// eslint-disable-next-line import/extensions
import packageJson from "../package.json";

const { version } = packageJson;

function install() {
	console.log(`Installing Danx UI ${version}... Nothing to do really.`);
}

export {
	version,
	install
};
