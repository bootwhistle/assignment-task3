import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatBytes } from '../utils';

export interface Picture {
    url: string;
    thumbnailUrl: string;
    fileName: string;
    size: number;
}

interface PictureInputProps {
    picture?: Picture;
    isUploading: boolean;
    onAdd: () => void;
    onRemove: () => void;
}

// Dashed "+" box while empty, spinner while uploading, then thumbnail + file name and size.
export default function PictureInput({ picture, isUploading, onAdd, onRemove }: PictureInputProps) {
    if (isUploading) {
        return (
            <View style={[styles.box, styles.emptyBox]}>
                <ActivityIndicator color="#15B6D6" />
                <Text style={styles.uploadingText}>Uploading picture...</Text>
            </View>
        );
    }

    if (!picture) {
        return (
            <TouchableOpacity style={[styles.box, styles.emptyBox]} onPress={onAdd} accessibilityLabel="Add picture">
                <Feather name="plus" size={24} color="#15B6D6" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.box, styles.filledBox]}>
            <Image style={styles.thumbnail} source={{ uri: picture.thumbnailUrl }} />
            <View style={styles.details}>
                <Text style={styles.detailsText} numberOfLines={1}>
                    {picture.fileName}
                </Text>
                <Text style={styles.detailsText}>{formatBytes(picture.size, 0)}</Text>
            </View>
            <TouchableOpacity onPress={onRemove} accessibilityLabel="Remove picture" hitSlop={12}>
                <Feather name="x" size={24} color="#FF1D4E" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        height: 72,
        borderRadius: 8,
        borderWidth: 1.4,
    },

    emptyBox: {
        backgroundColor: '#F5F8FA',
        borderColor: '#5EC6F8',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },

    filledBox: {
        backgroundColor: '#E5F6FF',
        borderColor: '#00A3FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 24,
    },

    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 4,
        backgroundColor: '#D3E2E5',
    },

    details: {
        flex: 1,
        marginLeft: 8,
    },

    detailsText: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 12,
        color: '#4D6F80',
    },

    uploadingText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
        color: '#8FA7B3',
        marginTop: 4,
    },
});
