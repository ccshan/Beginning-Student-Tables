import { Table } from "./input-definitions";

interface RecordedSnapshot {
    prefix: string
    tables: Array<Table>
}

type Snapshot = false | Array<RecordedSnapshot>

export function isSnapshotArray(snapshots: Snapshot): snapshots is Array<RecordedSnapshot> {
    return (snapshots as Array<RecordedSnapshot>) !== undefined;
}

export type { Snapshot };