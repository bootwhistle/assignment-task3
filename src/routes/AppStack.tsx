import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { VolunteeringEvent } from '../types/Event';
import { User } from '../types/User';

export type AppStackParamList = {
    Login: undefined;
    EventsMap: undefined;
    EventDetails: { event: VolunteeringEvent };
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

                    <Screen
                        name="EventDetails"
                        component={EventDetails}
                        options={{
                            headerShown: true,
                            title: 'Event',
                            headerTitleAlign: 'center',
                            headerBackTitle: '',
                            headerBackImage: () => (
                                <Feather name="arrow-left" size={24} color="#15B6D6" style={{ marginLeft: 16 }} />
                            ),
                            headerTitleStyle: { fontFamily: 'Nunito_600SemiBold', color: '#8FA7B3', fontSize: 16 },
                            headerStyle: {
                                backgroundColor: '#F9FAFC',
                                borderBottomWidth: 1,
                                borderBottomColor: '#DDE3F0',
                            },
                            headerShadowVisible: false,
                        }}
                    />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
