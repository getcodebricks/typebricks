export interface StoredEvent {
    aggregateId: string,
    aggregateVersion: number,
    name: string,
    payload: string,
    occuredAt: Date
};