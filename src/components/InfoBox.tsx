import { Feather } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface InfoBoxProps {
    color: string;
    backgroundColor: string;
    borderColor: string;
    featherIconName?: keyof typeof Feather.glyphMap;
    children: ReactNode;
}

export default function InfoBox({ color, backgroundColor, borderColor, featherIconName, children }: InfoBoxProps) {
    return (
        <View style={[styles.box, { backgroundColor, borderColor }]}>
            {featherIconName && <Feather style={styles.icon} name={featherIconName} size={40} color={color} />}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        height: 128,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        marginBottom: 12,
    },
});
