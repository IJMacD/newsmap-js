import React, { Component } from 'react';

export default class ErrorHandler extends Component {
    constructor (props) {
        super(props);

        this.state = {
            /** @type {Error?} */
            error: null,
        };
    }

    componentDidCatch (error) {
        this.setState({ error });
    }

    render () {
        if (this.state.error) {
            return (
                <div style={{ color: "white", margin: 32 }}>
                    <h1 style={{ textShadow: "2px 2px black" }}>There is some problem with your browser.</h1>
                    <p>Please open a new issue at <a href={`//github.com/IJMacD/newsmap-js/issues/new?title=Browser+Problem&amp;body=${encodeURIComponent(navigator.userAgent + "\n\n" + this.state.error.message)}`}>GitHub</a> if one does not already exist for your browser.</p>
                    <p><code>{this.state.error.message}</code></p>
                </div>
            );
        }

        return this.props.children;
    }
}
