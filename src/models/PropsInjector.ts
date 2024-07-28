import React from 'react';

class PropsInjector<Props extends React.JSX.IntrinsicAttributes = object> {
    props: Props;
    constructor(props: Props) {
        this.props = props;
    };

    toJS() {
        return `
            window.__sleepy_props__ = {
                _data: ${JSON.stringify(this.props)}
            };
        `
    }
}

export default PropsInjector;