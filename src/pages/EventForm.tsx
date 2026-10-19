import 'react-native-get-random-values';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import PictureInput, { Picture } from '../components/PictureInput';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { AppStackParamList } from '../routes/AppStack';
import * as api from '../services/api';
import { uploadImage } from '../services/imageApi';
import { VolunteeringEvent } from '../types/Event';
import { formatEventDate, formatEventTime } from '../utils/events';

const DESCRIPTION_MAX_LENGTH = 300;

// Step 2 of the new event workflow: event details. Every field is mandatory,
// so "Save" stays disabled until the form is valid.
export default function EventForm({ route, navigation }: StackScreenProps<AppStackParamList, 'EventForm'>) {
    const { position } = route.params;
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState<Date>();
    const [picture, setPicture] = useState<Picture>();
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const volunteersNeededNumber = Number(volunteersNeeded);
    const isFormValid =
        name.trim().length > 0 &&
        description.trim().length > 0 &&
        description.length <= DESCRIPTION_MAX_LENGTH &&
        Number.isInteger(volunteersNeededNumber) &&
        volunteersNeededNumber > 0 &&
        !!dateTime &&
        dateTime.getTime() > Date.now() &&
        !!picture &&
        !isUploading;

    const handleVolunteersNeededChange = (text: string) => setVolunteersNeeded(text.replace(/[^0-9]/g, ''));

    const handleConfirmDate = (date: Date) => {
        setIsDatePickerVisible(false);
        setDateTime(date);
    };

    const handleAddPicture = () => {
        showActionSheetWithOptions(
            { options: ['Take photo', 'Choose from library', 'Cancel'], cancelButtonIndex: 2 },
            (selectedIndex) => {
                if (selectedIndex === 0) pickPicture('camera');
                if (selectedIndex === 1) pickPicture('library');
            }
        );
    };

    const pickPicture = async (source: 'camera' | 'library') => {
        const permission =
            source === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permission needed',
                `Allow access to your ${source === 'camera' ? 'camera' : 'photos'} in the device settings to add a picture.`
            );
            return;
        }

        const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true };
        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets[0]?.base64) return;

        const asset = result.assets[0];
        setIsUploading(true);
        try {
            const uploaded = await uploadImage(asset.base64 as string);
            setPicture({
                url: uploaded.url,
                thumbnailUrl: uploaded.thumbnailUrl,
                fileName: asset.fileName ?? asset.uri.split('/').pop() ?? 'image.jpg',
                size: asset.fileSize ?? uploaded.size,
            });
        } catch (error) {
            console.log(error);
            Alert.alert('Upload failed', 'We could not upload your picture. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        if (!isFormValid || isSaving) return;

        const newEvent: VolunteeringEvent = {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim(),
            dateTime: (dateTime as Date).toISOString(),
            imageUrl: picture?.url,
            organizerId: authenticationContext?.value?.id as string,
            position,
            volunteersNeeded: volunteersNeededNumber,
            volunteersIds: [],
        };

        setIsSaving(true);
        api.createEvent(newEvent)
            .then(() => navigation.popTo('EventsMap'))
            .catch((error) => {
                console.log(error);
                Alert.alert('Something went wrong', 'We could not save your event. Please try again.');
            })
            .finally(() => setIsSaving(false));
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.label}>Event Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={100} />

            <View style={styles.labelRow}>
                <Text style={styles.label}>About</Text>
                <Text style={styles.comment}>{DESCRIPTION_MAX_LENGTH} characters max.</Text>
            </View>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                maxLength={DESCRIPTION_MAX_LENGTH}
                multiline
                textAlignVertical="top"
            />

            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput
                style={styles.input}
                value={volunteersNeeded}
                onChangeText={handleVolunteersNeededChange}
                keyboardType="number-pad"
                maxLength={4}
            />

            <Text style={styles.label}>Date and Time</Text>
            <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setIsDatePickerVisible(true)}>
                <Text style={styles.inputText}>
                    {dateTime ? `${formatEventDate(dateTime.toISOString())} ${formatEventTime(dateTime.toISOString())}` : ''}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                date={dateTime ?? new Date()}
                minimumDate={new Date()}
                onConfirm={handleConfirmDate}
                onCancel={() => setIsDatePickerVisible(false)}
            />

            <Text style={styles.label}>Picture</Text>
            <PictureInput
                picture={picture}
                isUploading={isUploading}
                onAdd={handleAddPicture}
                onRemove={() => setPicture(undefined)}
            />

            <View style={styles.saveButton}>
                <BigButton label="Save" color="#00A3FF" disabled={!isFormValid || isSaving} onPress={handleSave} />
            </View>

            <Spinner visible={isSaving} textContent="Saving..." overlayColor="#031A62BF" textStyle={styles.spinnerText} />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF1F5',
    },

    content: {
        padding: 24,
        paddingBottom: 40,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },

    label: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
        color: '#8FA7B3',
        marginTop: 16,
        marginBottom: 8,
    },

    comment: {
        fontFamily: 'Nunito_400Regular',
        fontSize: 11,
        color: '#8FA7B3',
    },

    input: {
        backgroundColor: '#FFF',
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        height: 56,
        paddingHorizontal: 12,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: '#5C8599',
    },

    multilineInput: {
        height: 110,
        paddingTop: 12,
    },

    dateInput: {
        justifyContent: 'center',
    },

    inputText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: '#5C8599',
    },

    saveButton: {
        flexDirection: 'row',
        marginTop: 16,
    },

    spinnerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#FFF',
    },
});
