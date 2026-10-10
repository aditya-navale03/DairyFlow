import React, { useState, useEffect } from 'react';


import {
    ActivityIndicator,
} from 'react-native';

import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    ScrollView,

} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Customer } from '../../types/customer';
import { subscribeToCustomers } from '../../services/customer/customerService';
import {
    getCustomerCollection,
    updateMilkCollection,
    addMilkCollection,
} from '../../services/collection/collectionService'; import { MilkCollection } from '../../types/collection';

export default function MissedCollectionScreen() {


    const [quantity, setQuantity] =
        useState('');

    const [rate, setRate] = useState('');
    const [isEditingRate, setIsEditingRate] = useState(false);

    const [session, setSession] =
        useState<'Morning' | 'Evening'>('Morning');

    const [existingMorning, setExistingMorning] =
        useState<MilkCollection | null>(null);

    const [existingEvening, setExistingEvening] =
        useState<MilkCollection | null>(null);

    const [checkingCollection, setCheckingCollection] =
        useState(false);

    const [loadingEdit, setLoadingEdit] = useState(false);

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [showCustomers, setShowCustomers] =
        useState(false);

    const [customerSearch, setCustomerSearch] = useState('');

    useEffect(() => {
        const unsubscribe = subscribeToCustomers(
            data => {
                setCustomers(data);
            },
        );

        return unsubscribe;
    }, []);

    const [selectedDate, setSelectedDate] =
        useState(new Date());

    const [showDatePicker, setShowDatePicker] =
        useState(false);

    useEffect(() => {
        const checkCollections = async () => {
            if (!selectedCustomer) {
                setExistingMorning(null);
                setExistingEvening(null);
                return;
            }

            setCheckingCollection(true);

            try {
                const year = selectedDate.getFullYear();
                const month = String(
                    selectedDate.getMonth() + 1,
                ).padStart(2, '0');
                const day = String(
                    selectedDate.getDate(),
                ).padStart(2, '0');

                const dateString =
                    `${year}-${month}-${day}`;

                const morning =
                    await getCustomerCollection(
                        selectedCustomer.id!,
                        dateString,
                        'Morning',
                    );

                const evening =
                    await getCustomerCollection(
                        selectedCustomer.id!,
                        dateString,
                        'Evening',
                    );

                setExistingMorning(morning);
                setExistingEvening(evening);
            } catch (error) {
                console.log(
                    'Collection check error:',
                    error,
                );
            } finally {
                setCheckingCollection(false);
            }
        };

        checkCollections();
    }, [selectedCustomer, selectedDate]);

    const [editingCollection, setEditingCollection] =
        useState<MilkCollection | null>(null);

    const [editingQuantity, setEditingQuantity] =
        useState('');

    const [editingRate, setEditingRate] =
        useState('');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>
                    Missed Collection
                </Text>

                <Text style={styles.label}>
                    Select Customer
                </Text>

                <TouchableOpacity
                    style={styles.customerButton}
                    onPress={() =>
                        setShowCustomers(!showCustomers)
                    }>
                    <Text style={styles.dateText}>
                        {selectedCustomer
                            ? selectedCustomer.name
                            : 'Select Customer'}
                    </Text>
                </TouchableOpacity>

                {showCustomers && (
                    <ScrollView
                        style={styles.customerList}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled">
                        <TextInput
                            placeholder="Search customer..."
                            value={customerSearch}
                            onChangeText={setCustomerSearch}
                            style={styles.customerSearchInput}
                            placeholderTextColor="#777777"
                        />

                        {customers
                            .filter(item =>
                                item.name
                                    .toLowerCase()
                                    .includes(customerSearch.trim().toLowerCase()),
                            )
                            .map(item => (


                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.customerItem}
                                    onPress={() => {
                                        setSelectedCustomer(item);
                                        setRate(String(item.rate));
                                        setIsEditingRate(false);
                                        setShowCustomers(false);
                                        setCustomerSearch('');
                                    }}>
                                    <Text style={styles.customerName}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>)}

                <Text style={styles.label}>
                    Select Collection Date
                </Text>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>
                        {`${String(selectedDate.getDate()).padStart(2, '0')}/${String(
                            selectedDate.getMonth() + 1,
                        ).padStart(2, '0')}/${selectedDate.getFullYear()}`}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        maximumDate={new Date()}
                        onChange={(event, date) => {
                            setShowDatePicker(false);

                            if (date) {
                                setSelectedDate(date);
                            }
                        }}
                    />
                )}

                <Text style={styles.sectionTitle}>
                    Collections
                </Text>

                {checkingCollection && (
                    <Text style={styles.checkingText}>
                        Checking existing collection...
                    </Text>
                )}

                {!checkingCollection &&
                    selectedCustomer &&
                    !existingMorning &&
                    !existingEvening && (
                        <Text style={styles.noCollectionText}>
                            No collection found for this date.
                        </Text>
                    )}
                {!checkingCollection &&
                    existingMorning && (
                        <View style={styles.existingBox}>
                            <Text style={styles.existingTitle}>
                                Morning Collection
                            </Text>

                            {editingCollection?.id === existingMorning.id ? (
                                <>
                                    <Text style={styles.editLabel}>
                                        Milk Quantity (Litres)
                                    </Text>

                                    <TextInput
                                        placeholder="Enter quantity"
                                        keyboardType="decimal-pad"
                                        value={editingQuantity}
                                        onChangeText={setEditingQuantity}
                                        style={styles.quantityInput}
                                    />


                                    <Text style={styles.label}>Rate (₹ per Litre)</Text>

                                    <View style={styles.rateInputRow}>
                                        <TextInput
                                            placeholder="Enter rate"
                                            keyboardType="decimal-pad"
                                            value={rate}
                                            onChangeText={setRate}
                                            editable={isEditingRate}
                                            style={styles.rateInput}
                                        />

                                        <TouchableOpacity
                                            style={styles.rateEditButton}
                                            onPress={() => setIsEditingRate(!isEditingRate)}
                                        >
                                            <Text style={styles.rateEditButtonText}>
                                                {isEditingRate ? 'Done' : 'Edit'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.saveEditButton}
                                        onPress={async () => {
                                            const newQuantity =
                                                Number(editingQuantity);
                                            const newRate =
                                                Number(editingRate);

                                            if (
                                                !editingQuantity ||
                                                !Number.isFinite(newQuantity) ||
                                                newQuantity <= 0 ||
                                                newQuantity > 100 ||
                                                !editingRate ||
                                                !Number.isFinite(newRate) ||
                                                newRate <= 0
                                            ) {
                                                Alert.alert(
                                                    'Validation',
                                                    'Please enter a valid quantity and rate',
                                                );
                                                return;
                                            }

                                            try {
                                                const year =
                                                    selectedDate.getFullYear();

                                                const month = String(
                                                    selectedDate.getMonth() + 1,
                                                ).padStart(2, '0');

                                                const day = String(
                                                    selectedDate.getDate(),
                                                ).padStart(2, '0');

                                                const dateString =
                                                    `${year}-${month}-${day}`;

                                                setLoadingEdit(true);

                                                await updateMilkCollection(
                                                    dateString,
                                                    existingMorning.id!,
                                                    newQuantity,
                                                    newRate,
                                                );



                                                setExistingMorning({
                                                    ...existingMorning,
                                                    quantity: newQuantity,
                                                    rate: newRate,
                                                });

                                                setEditingCollection(null);
                                                setEditingQuantity('');

                                                setEditingRate('');

                                                Alert.alert(
                                                    'Success',
                                                    'Collection updated successfully',
                                                );
                                            } catch (error) {
                                                console.log(
                                                    'Update collection error:',
                                                    error,
                                                );

                                                Alert.alert(
                                                    'Error',
                                                    'Failed to update collection',
                                                );
                                            } finally {
                                                setLoadingEdit(false);
                                            }
                                        }}>
                                        {loadingEdit ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.saveEditText}>
                                                Save Changes
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelEditButton}
                                        onPress={() => {
                                            setEditingCollection(null);
                                            setEditingQuantity('');

                                            setEditingRate('');
                                        }}>
                                        <Text style={styles.cancelEditText}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.existingText}>
                                        Quantity: {existingMorning.quantity} L
                                    </Text>

                                    <Text style={styles.existingText}>
                                        Rate: ₹{existingMorning.rate}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            setEditingCollection(existingMorning);

                                            setEditingQuantity(
                                                String(existingMorning.quantity),
                                            );

                                            setEditingRate(
                                                String(existingMorning.rate || ''),
                                            );


                                        }}>
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                {!checkingCollection &&
                    existingEvening && (
                        <View style={styles.existingBox}>
                            <Text style={styles.existingTitle}>
                                Evening Collection
                            </Text>

                            {editingCollection?.id === existingEvening.id ? (
                                <>
                                    <Text style={styles.editLabel}>
                                        Milk Quantity (Litres)
                                    </Text>

                                    <TextInput
                                        placeholder="Enter quantity"
                                        keyboardType="decimal-pad"
                                        value={editingQuantity}
                                        onChangeText={setEditingQuantity}
                                        style={styles.quantityInput}
                                    />
                                    <Text style={styles.editLabel}>
                                        Rate (₹ per Litre)
                                    </Text>

                                    <TextInput
                                        placeholder="Enter rate"
                                        keyboardType="decimal-pad"
                                        value={editingRate}
                                        onChangeText={setEditingRate}
                                        style={styles.quantityInput}
                                    />

                                    <TouchableOpacity
                                        style={styles.saveEditButton}
                                        onPress={async () => {
                                            const newQuantity =
                                                Number(editingQuantity);

                                            const newRate =
                                                Number(editingRate);

                                            if (
                                                !editingQuantity ||
                                                !Number.isFinite(newQuantity) ||
                                                newQuantity <= 0 ||
                                                newQuantity > 100 ||
                                                !editingRate ||
                                                !Number.isFinite(newRate) ||
                                                newRate <= 0
                                            ) {
                                                Alert.alert(
                                                    'Validation',
                                                    'Please enter a valid quantity and rate',
                                                );
                                                return;
                                            }

                                            try {
                                                const year =
                                                    selectedDate.getFullYear();

                                                const month = String(
                                                    selectedDate.getMonth() + 1,
                                                ).padStart(2, '0');

                                                const day = String(
                                                    selectedDate.getDate(),
                                                ).padStart(2, '0');

                                                const dateString =
                                                    `${year}-${month}-${day}`;

                                                setLoadingEdit(true);

                                                await updateMilkCollection(
                                                    dateString,
                                                    existingEvening.id!,
                                                    newQuantity,
                                                    newRate,);


                                                setExistingEvening({
                                                    ...existingEvening,
                                                    quantity: newQuantity,
                                                    rate: newRate,
                                                });

                                                setEditingCollection(null);
                                                setEditingQuantity('');

                                                setEditingRate('');

                                                Alert.alert(
                                                    'Success',
                                                    'Collection updated successfully',
                                                );
                                            } catch (error) {
                                                console.log(
                                                    'Update collection error:',
                                                    error,
                                                );

                                                Alert.alert(
                                                    'Error',
                                                    'Failed to update collection',
                                                );
                                            } finally {
                                                setLoadingEdit(false);
                                            }
                                        }}>
                                        <Text style={styles.saveEditText}>
                                            Save Changes
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelEditButton}
                                        onPress={() => {
                                            setEditingCollection(null);
                                            setEditingQuantity('');

                                            setEditingRate('');
                                        }}>
                                        <Text style={styles.cancelEditText}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.existingText}>
                                        Quantity: {existingEvening.quantity} L
                                    </Text>

                                    <Text style={styles.existingText}>
                                        Rate: ₹{existingEvening.rate}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            setEditingCollection(existingEvening);
                                            setEditingQuantity(
                                                String(existingEvening.quantity),
                                            );

                                            setEditingRate(
                                                String(existingEvening.rate || ''),
                                            );
                                        }}>
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                <Text style={styles.label}>
                    Collection Session
                </Text>

                <View style={styles.sessionRow}>
                    <TouchableOpacity
                        style={[
                            styles.sessionButton,
                            session === 'Morning' &&
                            styles.sessionButtonActive,
                        ]}
                        onPress={() => setSession('Morning')}>
                        <Text
                            style={[
                                styles.sessionText,
                                session === 'Morning' &&
                                styles.sessionTextActive,
                            ]}>
                            Morning
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sessionButton,
                            session === 'Evening' &&
                            styles.sessionButtonActive,
                        ]}
                        onPress={() => setSession('Evening')}>
                        <Text
                            style={[
                                styles.sessionText,
                                session === 'Evening' &&
                                styles.sessionTextActive,
                            ]}>
                            Evening
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>
                    Milk Quantity (Litres)
                </Text>

                <TextInput
                    placeholder="Enter quantity"
                    keyboardType="decimal-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                    style={styles.quantityInput}
                />

                <Text style={styles.label}>Rate (₹ per Litre)</Text>

                <TextInput
                    placeholder="Enter rate"
                    keyboardType="decimal-pad"
                    value={rate}
                    onChangeText={setRate}
                    style={styles.quantityInput}
                />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={async () => {
                        if (!selectedCustomer) {
                            Alert.alert('Validation', 'Please select a customer');
                            return;
                        }

                        const newQuantity = Number(quantity);
                        const newRate = Number(rate);

                        if (!quantity || !Number.isFinite(newQuantity) || newQuantity <= 0) {
                            Alert.alert('Validation', 'Please enter a valid quantity');
                            return;
                        }

                        if (!rate || !Number.isFinite(newRate) || newRate <= 0) {
                            Alert.alert('Validation', 'Please enter a valid rate');
                            return;
                        }

                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        const dateString = `${year}-${month}-${day}`;

                        try {
                            await addMilkCollection({
                                customerId: selectedCustomer.id!,
                                customerName: selectedCustomer.name,
                                collectionOrder: selectedCustomer.collectionOrder,
                                dateString,
                                date: selectedDate,
                                session,
                                quantity: newQuantity,
                                rate: newRate,
                                amount: newQuantity * newRate,
                            } as MilkCollection);

                            Alert.alert('Success', 'Collection saved successfully');
                            setQuantity('');
                            setRate('');
                        } catch (error) {
                            console.log('Save collection error:', error);
                            Alert.alert('Error', 'Failed to save collection');
                        }
                    }}>
                    <Text style={styles.saveButtonText}>
                        Save Collection
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {loadingEdit && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#1976D2" />
                    <Text style={styles.loadingText}>
                        Updating collection...
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        elevation: 10,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
    },

    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 18,
        paddingTop: 70,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 30,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },

    dateButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#90CAF9',
        marginBottom: 18,
    },

    customerButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#90CAF9',
        marginBottom: 8,
    },

    dateText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
    },

    //customer selector
    customerList: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 8,
        maxHeight: 200,
        width: '100%',
        flexGrow: 0,
        elevation: 4,
    },

    customerItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },

    customerName: {
        fontSize: 16,
        color: '#222',
        flexShrink: 1,
        flexWrap: 'wrap',
    },

    //mornign eeveing
    sessionRow: {
        flexDirection: 'row',
        gap: 10,
    },

    sessionButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#90CAF9',
        alignItems: 'center',
    },

    sessionButtonActive: {
        backgroundColor: '#1976D2',
    },

    sessionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1976D2',
    },

    sessionTextActive: {
        color: '#fff',
    },

    //collection inputs
    quantityInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#90CAF9',
        padding: 15,
        fontSize: 18,
        marginBottom: 15,
    },

    //check validation
    saveButton: {
        backgroundColor: '#1976D2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    checkingText: {
        marginTop: 15,
        color: '#1976D2',
        fontWeight: '600',
    },

    noCollectionText: {
        marginTop: 15,
        color: '#666',
        fontSize: 14,
    },

    existingBox: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E7EF',
        elevation: 2,
    },

    existingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
        marginTop: 5,
        marginBottom: 10,
    },

    existingText: {
        fontSize: 15,
        color: '#555',
        marginTop: 6,
    },
    editButton: {
        backgroundColor: '#1976D2',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 14,
    },

    editButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    editLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },

    editBox: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#1976D2',
    },

    editTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 12,
    },

    saveEditButton: {
        backgroundColor: '#1976D2',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },

    saveEditText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    cancelEditButton: {
        marginTop: 10,
        padding: 12,
        alignItems: 'center',
    },

    cancelEditText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '600',
    },

    customerSearchInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#90CAF9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#222222',
        margin: 12,
        marginBottom: 8,

    },


    rateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#90CAF9',
        marginBottom: 15,
        paddingRight: 8,
    },

    rateInput: {
        flex: 1,
        padding: 15,
        fontSize: 18,
        color: '#222',
    },

    rateEditButton: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },

    rateEditButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

});