import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoBoxProps {
    color: string;
    featherIconName: keyof typeof Feather.glyphMap;
    lines: string[];
}

export default function InfoBox({ color, featherIconName, lines }: InfoBoxProps) {
    return (
        <View style={[styles.box, { backgroundColor: color + '1A', borderColor: color + '66' }]}>
            <Feather name={featherIconName} size={32} color={color} />
            {lines.map((line) => (
                <Text key={line} style={[styles.text, { color }]}>
                    {line}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 4,
    },

    text: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
    },
});
