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
                            headerTintColor: '#00A3FF',
                            headerTitleStyle: { fontFamily: 'Nunito_700Bold', color: '#8FA7B3', fontSize: 15 },
                            headerStyle: { backgroundColor: '#F9FAFC' },
                        }}
                    />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
