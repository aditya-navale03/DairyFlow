import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import AppHeader from '../../components/common/AppHeader';

import {
    subscribeToCollectionsByMonth,
} from '../../services/collection/collectionService';

import {
    subscribeToBillPayments,
} from '../../services/billing/billingService';

import { Customer } from '../../types/customer';
import { MilkCollection } from '../../types/collection';

type Props = {
    route: {
        params: {
            customer: Customer;
        };
    };
};

type BillData = {
    customerId: string;
    month: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'Paid' | 'Pending';
};

export default function CustomerStatementScreen({
    route,
}: Props) {
    const { customer } = route.params;

    const [collections, setCollections] =
        useState<MilkCollection[]>([]);

    const [bills, setBills] =
        useState<BillData[]>([]);

    const [selectedMonth, setSelectedMonth] =
        useState(new Date());
    const [collectionsLoading, setCollectionsLoading] =
        useState(true);

    const [billsLoading, setBillsLoading] =
        useState(true);

    const loading =
        collectionsLoading || billsLoading;



    const year =
        selectedMonth.getFullYear();

    const month =
        selectedMonth.getMonth();

    const monthString =
        `${year}-${String(month + 1).padStart(2, '0')}`;

    const monthName =
        selectedMonth.toLocaleString(
            'default',
            {
                month: 'long',
                year: 'numeric',
            },
        );

    const goToPreviousMonth = () => {
        setSelectedMonth(
            new Date(
                year,
                month - 1,
                1,
            ),
        );
    };
    const goToNextMonth = () => {
        if (isCurrentMonth) {
            return;
        }

        setSelectedMonth(
            new Date(
                year,
                month + 1,
                1,
            ),
        );
    };
    const isCurrentMonth =
        year === new Date().getFullYear() &&
        month === new Date().getMonth();

    useEffect(() => {
        const monthStart =
            `${year}-${String(month + 1).padStart(2, '0')}-01`;

        const lastDay =
            new Date(
                year,
                month + 1,
                0,
            ).getDate();

        const monthEnd =
            `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        setCollectionsLoading(true);
        setBillsLoading(true);

        const unsubscribeCollections =
            subscribeToCollectionsByMonth(
                monthStart,
                monthEnd,
                data => {
                    const customerCollections =
                        data.filter(
                            item =>
                                item.customerId ===
                                customer.id,
                        );
                    setCollections(
                        customerCollections,
                    );

                    setCollectionsLoading(false);
                },
            );

        const unsubscribeBills =
            subscribeToBillPayments(
                monthString,
                data => {
                    const customerBills =
                        data.filter(
                            item =>
                                item.customerId ===
                                customer.id,
                        );

                    setBills(
                        customerBills,
                    );
                    setBillsLoading(false);
                },
            );

        return () => {
            unsubscribeCollections();
            unsubscribeBills();
        };
    }, [
        customer.id,
        year,
        month,
        monthString,
    ]);

    const morning =
        collections
            .filter(
                item =>
                    item.session === 'Morning',
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0,
            );

    const evening =
        collections
            .filter(
                item =>
                    item.session === 'Evening',
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0,
            );

    const totalMilk =
        morning + evening;

    const calculatedBill =
        totalMilk *
        Number(customer.rate || 0);

    const savedBill =
        bills[0];

    const paid =
        Number(
            savedBill?.paidAmount || 0,
        );

    const remaining =
        Math.max(
            calculatedBill - paid,
            0,
        );

    const isPaid =
        calculatedBill > 0 &&
        remaining === 0;

    return (
        <SafeAreaView
            style={styles.container}>

            <AppHeader
                title="Customer Statement"
            />

            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }>

                <View
                    style={styles.customerCard}>

                    <Text
                        style={styles.customerNumber}>
                        #{customer.collectionOrder}
                    </Text>

                    <Text
                        style={styles.customerName}>
                        {customer.name}
                    </Text>

                    <Text
                        style={styles.customerInfo}>
                        📍 {customer.village}
                    </Text>

                    <Text
                        style={styles.customerRate}>
                        ₹{customer.rate}/L
                    </Text>

                </View>
                <View style={styles.monthCard}>

                    <TouchableOpacity
                        style={styles.monthButton}
                        onPress={goToPreviousMonth}>

                        <Text style={styles.monthArrow}>
                            ◀
                        </Text>

                    </TouchableOpacity>

                    <View style={styles.monthCenter}>

                        <Text style={styles.monthText}>
                            {monthName}
                        </Text>

                        {loading && (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                                style={styles.loader}
                            />
                        )}

                    </View>

                    <TouchableOpacity
                        style={[
                            styles.monthButton,
                            isCurrentMonth &&
                            styles.disabledMonthButton,
                        ]}
                        disabled={isCurrentMonth}
                        onPress={goToNextMonth}>

                        <Text
                            style={[
                                styles.monthArrow,
                                isCurrentMonth &&
                                styles.disabledArrow,
                            ]}>
                            ▶
                        </Text>

                    </TouchableOpacity>

                </View>

                {loading ? (
                    <View style={styles.loadingCard}>

                        <ActivityIndicator
                            size="large"
                            color="#1976D2"
                        />

                        <Text style={styles.loadingText}>
                            Loading {monthName}...
                        </Text>

                    </View>
                ) : (
                    <>
                        <View
                            style={styles.summaryCard}>

                            <Text
                                style={styles.cardTitle}>
                                Milk Collection
                            </Text>

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.label}>
                                    Morning
                                </Text>

                                <Text
                                    style={styles.value}>
                                    {morning.toFixed(2)} L
                                </Text>

                            </View>

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.label}>
                                    Evening
                                </Text>

                                <Text
                                    style={styles.value}>
                                    {evening.toFixed(2)} L
                                </Text>

                            </View>

                            <View
                                style={styles.divider}
                            />

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.totalLabel}>
                                    Total Milk
                                </Text>

                                <Text
                                    style={styles.totalValue}>
                                    {totalMilk.toFixed(2)} L
                                </Text>

                            </View>

                        </View>
                        <View
                            style={styles.summaryCard}>

                            <Text
                                style={styles.cardTitle}>
                                Payment
                            </Text>

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.label}>
                                    Bill
                                </Text>

                                <Text
                                    style={styles.billValue}>
                                    ₹{calculatedBill.toFixed(2)}
                                </Text>

                            </View>

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.label}>
                                    Paid
                                </Text>

                                <Text
                                    style={styles.paidValue}>
                                    ₹{paid.toFixed(2)}
                                </Text>

                            </View>

                            <View
                                style={styles.row}>

                                <Text
                                    style={styles.label}>
                                    Remaining
                                </Text>

                                <Text
                                    style={styles.remainingValue}>
                                    ₹{remaining.toFixed(2)}
                                </Text>

                            </View>

                            <View
                                style={styles.statusContainer}>

                                <Text
                                    style={[
                                        styles.status,
                                        isPaid
                                            ? styles.paidStatus
                                            : styles.pendingStatus,
                                    ]}>

                                    {isPaid
                                        ? 'PAID'
                                        : 'PENDING'}

                                </Text>

                            </View>

                        </View>
                    </>
                )}

            </ScrollView>

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    loadingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 40,
        marginTop: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    content: {
        padding: 16,
        paddingBottom: 30,
    },

    customerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        elevation: 2,
    },

    customerNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1976D2',
    },

    customerName: {
        fontSize: 21,
        fontWeight: '700',
        color: '#222',
        marginTop: 5,
    },

    customerInfo: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },

    customerRate: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2E7D32',
        marginTop: 5,
    },

    monthCard: {
        backgroundColor: '#1976D2',
        borderRadius: 12,
        padding: 10,
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },

    monthText: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '700',
    },

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginTop: 14,
        elevation: 2,
    },

    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
        marginBottom: 14,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    label: {
        fontSize: 14,
        color: '#666',
    },

    value: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },

    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },

    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222',
    },

    totalValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1976D2',
    },

    billValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1976D2',
    },

    paidValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2E7D32',
    },

    remainingValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#C62828',
    },

    statusContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    status: {
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: '700',
    },

    paidStatus: {
        color: '#2E7D32',
        backgroundColor: '#E8F5E9',
    },

    pendingStatus: {
        color: '#C62828',
        backgroundColor: '#FFEBEE',
    },
    monthButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    monthCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    monthArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    disabledMonthButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    disabledArrow: {
        color: 'rgba(255,255,255,0.4)',
    },

    loader: {
        marginTop: 5,
    },
});