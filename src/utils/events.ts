import { EventStatus, VolunteeringEvent } from '../types/Event';

export const isFutureEvent = (event: VolunteeringEvent): boolean => new Date(event.dateTime).getTime() > Date.now();

export const isEventFull = (event: VolunteeringEvent): boolean =>
    event.volunteersIds.length >= event.volunteersNeeded;

export const getEventStatus = (event: VolunteeringEvent, userId?: string): EventStatus => {
    if (userId && event.volunteersIds.includes(userId)) return 'volunteered';
    return isEventFull(event) ? 'full' : 'open';
};

// e.g. "Oct 20, 2023"
export const formatEventDate = (dateTime: string): string =>
    new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// e.g. "11:00 AM"
export const formatEventTime = (dateTime: string): string =>
    new Date(dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
