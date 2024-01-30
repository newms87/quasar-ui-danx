import Component from "./components/Component";

export * from "./helpers";
export * from './components/DragAndDrop';

const version = __UI_VERSION__;

function install(app) {
    app.component(Component.name, Component);

}

export {
    version,
    Component,

    install
};
