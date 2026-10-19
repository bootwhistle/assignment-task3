import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, { LatLng, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';
import { AppStackParamList } from '../routes/AppStack';

// Step 1 of the new event workflow: the user touches the map to choose where the event takes place.
export default function SelectEventLocation({ navigation }: StackScreenProps<AppStackParamList, 'SelectEventLocation'>) {
    const [position, setPosition] = useState<LatLng>();

    const handleMapPress = (event: MapPressEvent) => {
        setPosition(event.nativeEvent.coordinate);
    };

    const handleNext = () => {
        if (position) navigation.navigate('EventForm', { position });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
                showsMyLocationButton={false}
                rotateEnabled={false}
                toolbarEnabled={false}
                onPress={handleMapPress}
            >
                {position && (
                    <Marker coordinate={position}>
                        <Image resizeMode="contain" style={styles.marker} source={mapMarkerImg} />
                    </Marker>
                )}
            </MapView>

            {position && (
                <View style={styles.footer}>
                    <BigButton label="Next" color="#00A3FF" onPress={handleNext} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapStyle: {
        ...StyleSheet.absoluteFill,
    },

    marker: {
        width: 48,
        height: 54,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,
        flexDirection: 'row',
    },
});
