import React from 'react';
import ReactTable from 'react-table';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router-dom';

/*
interface Props {
    value: number
    
}
interface State {
    recordings: any
}
*/
class ListRecordings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { recordings: false };
    }

    componentDidMount() {
        fetch(`${process.env.PUBLIC_URL}/list`)
            .then(response => response.json())
            .then(o => {
                this.setState({
                    recordings: Object.entries(o).flatMap(([name, info]) => name.startsWith('session') ? [{ id: name.slice(7), ...info }] : [])
                });
            });
        // TODO: indicate request and error by yellow and pink
    }

    render() {
        const alignRight = { 'text-align': 'right' };
        const columns = [{
            Cell: props => <Link to={`${process.env.PUBLIC_URL}/session${props.value}/`}>{props.value}</Link>,
            Header: 'Session ID',
            accessor: 'id',
            maxWidth: 150
        }, {
            Cell: props => {
                const date = new Date(1000 * props.value);
                const abs = date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' });
                return <div className="date">
                    <span>{abs}</span>
                    <TimeAgo date={date} />
                </div>;
            },
            defaultSortDesc: true,
            Header: 'Last recording time',
            accessor: 'time',
            maxWidth: 350
        }, {
            defaultSortDesc: true,
            Header: 'Size (bytes)',
            accessor: 'size',
            headerStyle: alignRight,
            style: alignRight,
            maxWidth: 150
        }];

        return (this.state.recordings
            ? <ReactTable
                data={this.state.recordings}
                columns={columns}
                defaultSorted={[{ id: 'time', desc: true }]} />
            : <p>Loading list of recordings</p>);
    }
}

export { ListRecordings };