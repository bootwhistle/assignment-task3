import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import InfoBox from '../components/InfoBox';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { AppStackParamList } from '../routes/AppStack';
import * as api from '../services/api';
import { User } from '../types/User';
import { getDirectionsUrl } from '../utils';
import { formatEventDate, formatEventTime, getEventStatus } from '../utils/events';

export default function EventDetails({ route, navigation }: StackScreenProps<AppStackParamList, 'EventDetails'>) {
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const [event, setEvent] = useState(route.params.event);
    const [organizer, setOrganizer] = useState<User>();
    const [isSaving, setIsSaving] = useState(false);

    const status = getEventStatus(event, currentUserId);
    const eventDate = formatEventDate(event.dateTime);
    const eventTime = formatEventTime(event.dateTime);
    const organizerPhone = organizer?.mobile.replace(/[^\d+]/g, '');

    useEffect(() => {
        api.getUser(event.organizerId)
            .then((response) => setOrganizer(response.data))
            .catch((error) => console.log(error));
    }, [event.organizerId]);

    const openUrl = (url: string) =>
        Linking.openURL(url).catch(() => Alert.alert('Unable to open', 'No app on this device can handle this action.'));

    const handleCall = () => organizerPhone && openUrl(`tel:${organizerPhone}`);

    const handleText = () => organizerPhone && openUrl(`sms:${organizerPhone}`);

    const handleGetDirections = () => openUrl(getDirectionsUrl(event.position));

    const handleShare = () =>
        Share.share({
            title: event.name,
            message: `${event.name} - ${eventDate} at ${eventTime}\n\n${event.description}`,
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
                        organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                )}
                <Text style={styles.description}>{event.description}</Text>

                <View style={[styles.row, styles.section]}>
                    <InfoBox color="#00A3FF" backgroundColor="#E5F6FF" borderColor="#00A3FF" featherIconName="calendar">
                        <Text style={[styles.boxText, { color: '#00A3FF' }]}>
                            {eventDate}
                            {'\n'}
                            {eventTime}
                        </Text>
                    </InfoBox>

                    {status === 'volunteered' && (
                        <InfoBox color="#00A3FF" backgroundColor="#E5F6FF" borderColor="#00A3FF" featherIconName="check">
                            <Text style={[styles.boxText, { color: '#00A3FF' }]}>Volunteered</Text>
                        </InfoBox>
                    )}

                    {status === 'open' && (
                        <InfoBox color="#FF8700" backgroundColor="#F2E6D9" borderColor="#FF8700">
                            <Text style={styles.volunteersCount}>
                                {event.volunteersIds.length}
                                <Text style={styles.volunteersCountOf}> of </Text>
                                {event.volunteersNeeded}
                            </Text>
                            <Text style={[styles.boxText, { color: '#FF8700' }]}>Volunteer(s){'\n'}needed</Text>
                        </InfoBox>
                    )}

                    {status === 'full' && (
                        <InfoBox color="#8FA7B3" backgroundColor="#D3E2E5" borderColor="#A1BCC6" featherIconName="slash">
                            <Text style={[styles.boxText, { color: '#8FA7B3' }]}>Team is full</Text>
                        </InfoBox>
                    )}
                </View>

                {status !== 'full' && (
                    <View style={[styles.row, styles.section]}>
                        <BigButton
                            style={styles.rowButton}
                            label="Share"
                            color="#00A3FF"
                            featherIconName="share-2"
                            onPress={handleShare}
                        />

                        {status === 'volunteered' && (
                            <>
                                <BigButton
                                    style={styles.rowButton}
                                    label="Call"
                                    color="#00A3FF"
                                    featherIconName="phone"
                                    disabled={!organizerPhone}
                                    onPress={handleCall}
                                />
                                <BigButton
                                    style={styles.rowButton}
                                    label="Text"
                                    color="#00A3FF"
                                    featherIconName="message-circle"
                                    disabled={!organizerPhone}
                                    onPress={handleText}
                                />
                            </>
                        )}

                        {status === 'open' && (
                            <BigButton
                                style={styles.rowButton}
                                label="Volunteer"
                                color="#FF8700"
                                featherIconName="plus"
                                disabled={isSaving}
                                onPress={handleVolunteer}
                            />
                        )}
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.mapContainer} pointerEvents="none">
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        customMapStyle={customMapStyle}
                        initialRegion={{ ...event.position, ...MapSettings.DEFAULT_DELTA }}
                        toolbarEnabled={false}
                    >
                        <Marker coordinate={event.position}>
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                        </Marker>
                    </MapView>
                </View>

                <View style={[styles.row, styles.directionsButton]}>
                    <BigButton
                        label="Get Directions to Event"
                        color="#4D6F80"
                        featherIconName="map-pin"
                        onPress={handleGetDirections}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF1F5',
    },

    content: {
        paddingBottom: 40,
    },

    image: {
        width: '100%',
        height: 210,
    },

    imagePlaceholder: {
        backgroundColor: '#D3E2E5',
    },

    body: {
        padding: 24,
    },

    title: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 24,
        color: '#4D6F80',
    },

    organizer: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 14,
        color: '#4D6F80',
    },

    description: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 16,
        lineHeight: 18,
        color: '#5C8599',
        marginTop: 12,
    },

    section: {
        marginTop: 24,
    },

    row: {
        flexDirection: 'row',
        gap: 8,
    },

    boxText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        textAlign: 'center',
    },

    volunteersCount: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 30,
        color: '#FF8700',
        marginBottom: 4,
    },

    volunteersCountOf: {
        fontSize: 20,
    },

    rowButton: {
        paddingHorizontal: 8,
    },

    divider: {
        height: 1,
        backgroundColor: '#D3E2E5',
        marginVertical: 24,
    },

    mapContainer: {
        height: 320,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#B3DAE2',
        overflow: 'hidden',
    },

    map: {
        flex: 1,
    },

    directionsButton: {
        marginTop: 16,
    },
});
