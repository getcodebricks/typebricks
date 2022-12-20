export interface StoredEvent {
    aggregateId: string,
    aggregateVersion: number,
    topic: string,
    name: string,
    payload: string,
    occuredAt: Date
};