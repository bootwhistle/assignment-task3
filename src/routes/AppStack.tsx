import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { LatLng } from 'react-native-maps';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import EventForm from '../pages/EventForm';
import SelectEventLocation from '../pages/SelectEventLocation';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { VolunteeringEvent } from '../types/Event';
import { User } from '../types/User';

export type AppStackParamList = {
    Login: undefined;
    EventsMap: undefined;
    EventDetails: { event: VolunteeringEvent };
    SelectEventLocation: undefined;
    EventForm: { position: LatLng };
};

const { Navigator, Screen } = createStackNavigator<AppStackParamList>();

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <NavigationContainer>
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />

                    <Screen name="EventDetails" component={EventDetails} options={headerOptions('Event')} />

                    <Screen
                        name="SelectEventLocation"
                        component={SelectEventLocation}
                        options={({ navigation }) => ({
                            ...headerOptions('Add event'),
                            headerRight: () => <CancelButton onPress={() => navigation.popTo('EventsMap')} />,
                        })}
                    />

                    <Screen
                        name="EventForm"
                        component={EventForm}
                        options={({ navigation }) => ({
                            ...headerOptions('Add event'),
                            headerRight: () => <CancelButton onPress={() => navigation.popTo('EventsMap')} />,
                        })}
                    />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}

// Shared header style for the screens pushed on top of the map
const headerOptions = (title: string): StackNavigationOptions => ({
    headerShown: true,
    title,
    headerTitleAlign: 'center',
    headerBackTitle: '',
    headerBackImage: () => <Feather name="arrow-left" size={24} color="#15B6D6" style={{ marginLeft: 16 }} />,
    headerTitleStyle: { fontFamily: 'Nunito_600SemiBold', color: '#8FA7B3', fontSize: 16 },
    headerStyle: {
        backgroundColor: '#F9FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#DDE3F0',
    },
    headerShadowVisible: false,
});

// Red "X" that abandons the new event workflow and returns to the map
const CancelButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} accessibilityLabel="Cancel" hitSlop={12} style={{ marginRight: 16 }}>
        <Feather name="x" size={24} color="#FF1D4E" />
    </TouchableOpacity>
);
