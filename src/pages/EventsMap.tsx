import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Platform, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import mapMarkerImg from '../images/map-marker.png';
import { AppStackParamList } from '../routes/AppStack';
import * as api from '../services/api';
import { getFromNetworkFirst } from '../services/caching';
import { EventStatus, VolunteeringEvent } from '../types/Event';
import { getEventStatus, isFutureEvent } from '../utils/events';

const EVENTS_CACHE_KEY = 'events';

const markerImages: Record<EventStatus, ImageSourcePropType> = {
    open: mapMarkerImg,
    volunteered: mapMarkerBlueImg,
    full: mapMarkerGreyImg,
};

export default function EventsMap(props: StackScreenProps<AppStackParamList, 'EventsMap'>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const mapViewRef = useRef<MapView>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [events, setEvents] = useState<VolunteeringEvent[]>([]);
    const [userLocation, setUserLocation] = useState<LatLng>();

    // Reload events and the user location every time the map screen gets focus,
    // so changes made on other screens (volunteering, creating an event) are reflected here.
    // Events come from the API when the network is available (and are cached in AsyncStorage);
    // otherwise the last cached list is used.
    useFocusEffect(
        useCallback(() => {
            getFromNetworkFirst<VolunteeringEvent[]>(
                EVENTS_CACHE_KEY,
                api.getEvents().then((response) => response.data)
            )
                .then((allEvents) => setEvents(allEvents.filter(isFutureEvent)))
                .catch((error) => console.log(error));
            getUserLocation().then(setUserLocation);
        }, [])
    );

    useEffect(() => {
        if (isMapReady) fitMapToContent();
    }, [isMapReady, events, userLocation]);

    const fitMapToContent = () => {
        const coordinates = events.map(({ position }) => position);
        if (userLocation) coordinates.push(userLocation);

        if (coordinates.length > 1) {
            mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING });
        } else if (coordinates.length === 1) {
            mapViewRef.current?.animateToRegion({ ...coordinates[0], ...MapSettings.DEFAULT_DELTA });
        }
    };

    const handleNavigateToCreateEvent = () => {
        navigation.navigate('SelectEventLocation');
    };

    const handleNavigateToEventDetails = (event: VolunteeringEvent) => {
        navigation.navigate('EventDetails', { event });
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onMapReady={() => setIsMapReady(true)}
            >
                {events.map((event) => {
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event)}
                        >
                            <Image
                                resizeMode="contain"
                                style={{ width: 48, height: 54 }}
                                source={markerImages[getEventStatus(event, currentUserId)]}
                            />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {events.length} {events.length === 1 ? 'event' : 'events'} found
                </Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFill,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});

const getUserLocation = async (): Promise<LatLng | undefined> => {
    try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) return undefined;

        const location =
            (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync());
        return { latitude: location.coords.latitude, longitude: location.coords.longitude };
    } catch (error) {
        console.log(error);
        return undefined;
    }
};
