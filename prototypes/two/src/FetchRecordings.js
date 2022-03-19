import React from 'react';
import { sessionURL } from './sendifier.js';
import { App } from './App';
import { Snapshot } from './recording-definitions';

/*
interface Props {
    match : any

}

interface State {
    snapshots: boolean | Array<Snapshot>
}
*/
class FetchRecordings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { snapshots: false };
    }

    componentDidMount() {
        this.playbackSessionIDChange();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id)
            this.playbackSessionIDChange();
    }

    playbackSessionIDChange() {
        const playbackSessionID = this.props.match.params.id;
        this.setState({ snapshots: false });
        if (playbackSessionID.length > 0) {
            const url = sessionURL(playbackSessionID);
            fetch(url)
                .then(response => response.json())
                .then(snapshots => {
                    if (snapshots.every(snapshot => !('prefix' in snapshot) &&
                        !('tables' in snapshot))) {
                        // Try to upgrade old snapshot
                        snapshots = snapshots.map(tables => ({ prefix: '', tables }));
                    }
                    this.setState({ snapshots });
                }); // TODO: indicate request and error by yellow and pink
        }
    }

    render() {
        return (this.state.snapshots
            ? <App snapshots={this.state.snapshots} />
            : <p>
                Loading session {this.props.match.params.id} for playback
            </p>);
    }
}

export { FetchRecordings };
