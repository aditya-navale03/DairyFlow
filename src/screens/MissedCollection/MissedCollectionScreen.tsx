import React, { useState, useEffect } from 'react';

import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    TextInput,
    Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Customer } from '../../types/customer';
import { subscribeToCustomers } from '../../services/customer/customerService';
import {
    getCustomerCollection,
    updateMilkCollection,
} from '../../services/collection/collectionService'; import { MilkCollection } from '../../types/collection';

export default function MissedCollectionScreen() {

    const [quantity, setQuantity] =
        useState('');

    const [session, setSession] =
        useState<'Morning' | 'Evening'>('Morning');

    const [existingMorning, setExistingMorning] =
        useState<MilkCollection | null>(null);

    const [existingEvening, setExistingEvening] =
        useState<MilkCollection | null>(null);

    const [checkingCollection, setCheckingCollection] =
        useState(false);

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [showCustomers, setShowCustomers] =
        useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>
                Missed Collection
            </Text>

            <Text style={styles.label}>
                Select Customer
            </Text>

            <TouchableOpacity
                style={styles.dateButton}
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
                <View style={styles.customerList}>
                    <FlatList
                        data={customers}
                        keyExtractor={item => item.id!}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.customerItem}
                                onPress={() => {
                                    setSelectedCustomer(item);
                                    setShowCustomers(false);
                                }}>
                                <Text style={styles.customerName}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

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
                            }}>
                            <Text style={styles.editButtonText}>
                                Edit
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            {!checkingCollection &&
                existingEvening && (
                    <View style={styles.existingBox}>
                        <Text style={styles.existingTitle}>
                            Evening Collection
                        </Text>

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
                            }}>
                            <Text style={styles.editButtonText}>
                                Edit
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
{editingCollection && (
  <View style={styles.editBox}>
    <Text style={styles.editTitle}>
      Edit {editingCollection.session} Collection
    </Text>

    <TextInput
      placeholder="Enter quantity"
      keyboardType="decimal-pad"
      value={editingQuantity}
      onChangeText={setEditingQuantity}
      style={styles.quantityInput}
    />

    <TouchableOpacity
      style={styles.saveEditButton}
      onPress={() => {
        Alert.alert(
          'Test',
          `New quantity: ${editingQuantity}`,
        );
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
      }}>
      <Text style={styles.cancelEditText}>
        Cancel
      </Text>
    </TouchableOpacity>
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

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                    if (!selectedCustomer) {
                        Alert.alert('Validation', 'Please select a customer');
                        return;
                    }

                    if (!quantity) {
                        Alert.alert('Validation', 'Please enter milk quantity');
                        return;
                    }

                    Alert.alert(
                        'Ready',
                        `${selectedCustomer.name} - ${quantity} L - ${session}`,
                    );
                }}>
                <Text style={styles.saveButtonText}>
                    Save Collection
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#90CAF9',
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
        maxHeight: 250,
        elevation: 4,
    },

    customerItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    customerName: {
        fontSize: 16,
        color: '#222',
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
        borderRadius: 10,
        padding: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },

    existingTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1976D2',
        marginBottom: 8,
    },

    existingText: {
        fontSize: 15,
        color: '#333',
        marginTop: 4,
    },

    editButton: {
        backgroundColor: '#1976D2',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },

    editButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
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
});