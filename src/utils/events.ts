import { EventStatus, VolunteeringEvent } from '../types/Event';

export const isFutureEvent = (event: VolunteeringEvent): boolean => new Date(event.dateTime).getTime() > Date.now();

export const isEventFull = (event: VolunteeringEvent): boolean =>
    event.volunteersIds.length >= event.volunteersNeeded;

export const getEventStatus = (event: VolunteeringEvent, userId?: string): EventStatus => {
    if (userId && event.volunteersIds.includes(userId)) return 'volunteered';
    return isEventFull(event) ? 'full' : 'open';
};
