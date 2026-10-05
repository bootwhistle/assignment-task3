import { LatLng } from 'react-native-maps';

export interface VolunteeringEvent {
    id: string;
    name: string;
    description: string;
    dateTime: string;
    imageUrl?: string;
    organizerId: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

export type EventStatus = 'volunteered' | 'open' | 'full';
