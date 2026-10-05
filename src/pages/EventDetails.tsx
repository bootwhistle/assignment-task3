import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import InfoBox from '../components/InfoBox';
import Spacer from '../components/Spacer';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { AppStackParamList } from '../routes/AppStack';
import * as api from '../services/api';
import { EventStatus } from '../types/Event';
import { User } from '../types/User';
import { formatAMPM, getMapsUrl } from '../utils';
import { getEventStatus } from '../utils/events';

const statusColors: Record<EventStatus, string> = {
    volunteered: '#00A3FF',
    open: '#FF8700',
    full: '#8FA7B3',
};

const statusIcons: Record<EventStatus, 'check' | 'users' | 'slash'> = {
    volunteered: 'check',
    open: 'users',
    full: 'slash',
};

export default function EventDetails({ route, navigation }: StackScreenProps<AppStackParamList, 'EventDetails'>) {
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const [event, setEvent] = useState(route.params.event);
    const [organizer, setOrganizer] = useState<User>();
    const [isSaving, setIsSaving] = useState(false);

    const status = getEventStatus(event, currentUserId);
    const eventDate = new Date(event.dateTime);

    useEffect(() => {
        api.getUser(event.organizerId)
            .then((response) => setOrganizer(response.data))
            .catch((error) => console.log(error));
    }, [event.organizerId]);

    const statusLines: Record<EventStatus, string[]> = {
        volunteered: ['Volunteered'],
        open: [`${event.volunteersIds.length} of ${event.volunteersNeeded}`, 'Volunteer(s) needed'],
        full: ['Team is full'],
    };

    const organizerPhone = organizer?.mobile.replace(/[^\d+]/g, '');

    const openUrl = (url: string) =>
        Linking.openURL(url).catch(() => Alert.alert('Unable to open', 'No app on this device can handle this action.'));

    const handleCall = () => organizerPhone && openUrl(`tel:${organizerPhone}`);

    const handleText = () => organizerPhone && openUrl(`sms:${organizerPhone}`);

    const handleShowRoutes = () => openUrl(getMapsUrl(event.position));

    const handleShare = () =>
        Share.share({
            title: event.name,
            message: `${event.name} - ${eventDate.toDateString()} at ${formatAMPM(eventDate)}\n\n${event.description}`,
        });

    const handleVolunteer = () => {
        if (!currentUserId || isSaving) return;
        setIsSaving(true);
        api.updateEventVolunteers(event.id, [...event.volunteersIds, currentUserId])
            .then((response) => {
                setEvent(response.data);
                navigation.setParams({ event: response.data });
            })
            .catch(() => Alert.alert('Something went wrong', 'We could not register you as a volunteer.'))
            .finally(() => setIsSaving(false));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {event.imageUrl ? (
                <Image style={styles.image} resizeMode="cover" source={{ uri: event.imageUrl }} />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
            )}

            <View style={styles.body}>
                <Text style={styles.title}>{event.name}</Text>
                {organizer && (
                    <Text style={styles.organizer}>
                        Organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                )}
                <Text style={styles.description}>{event.description}</Text>

                <Spacer size={24} />
                <View style={styles.row}>
                    <InfoBox
                        color="#00A3FF"
                        featherIconName="calendar"
                        lines={[eventDate.toDateString(), formatAMPM(eventDate)]}
                    />
                    <Spacer horizontal size={16} />
                    <InfoBox color={statusColors[status]} featherIconName={statusIcons[status]} lines={statusLines[status]} />
                </View>

                <Spacer size={16} />
                <View style={styles.row}>
                    <BigButton
                        label="Show routes on map"
                        color="#4D6F80"
                        featherIconName="map-pin"
                        onPress={handleShowRoutes}
                    />
                </View>

                {status === 'volunteered' && (
                    <>
                        <Spacer size={16} />
                        <View style={styles.row}>
                            <BigButton
                                label="Call"
                                color="#00A3FF"
                                featherIconName="phone"
                                disabled={!organizerPhone}
                                onPress={handleCall}
                            />
                            <Spacer horizontal size={16} />
                            <BigButton
                                label="Text"
                                color="#00A3FF"
                                featherIconName="message-circle"
                                disabled={!organizerPhone}
                                onPress={handleText}
                            />
                        </View>
                    </>
                )}

                {status !== 'full' && (
                    <>
                        <Spacer size={16} />
                        <View style={styles.row}>
                            <BigButton label="Share" color="#00A3FF" featherIconName="share-2" onPress={handleShare} />
                            {status === 'open' && (
                                <>
                                    <Spacer horizontal size={16} />
                                    <BigButton
                                        label="Volunteer"
                                        color="#FF8700"
                                        featherIconName="plus"
                                        disabled={isSaving}
                                        onPress={handleVolunteer}
                                    />
                                </>
                            )}
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        paddingBottom: 40,
    },

    image: {
        width: '100%',
        height: 240,
    },

    imagePlaceholder: {
        backgroundColor: '#D3E2E5',
    },

    body: {
        padding: 24,
    },

    title: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 30,
        color: '#4D6F80',
    },

    organizer: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
        color: '#8FA7B3',
        marginTop: 4,
    },

    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 24,
        color: '#5C8599',
        marginTop: 16,
    },

    row: {
        flexDirection: 'row',
    },
});
