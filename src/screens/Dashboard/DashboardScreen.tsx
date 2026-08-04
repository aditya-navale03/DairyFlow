import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import AppHeader from '../../components/common/AppHeader';
import SummaryCard from '../../components/dashboard/SummaryCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <AppHeader
        title="Dairy Manager"
        subtitle="Welcome, Admin 👋"
      />



      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionTitle}>Today's Summary</Text>

        <View style={styles.row}>
          <SummaryCard title="Customers" value="0" />
          <SummaryCard title="Today's Milk" value="0 L" />
        </View>

        <View style={styles.row}>
          <SummaryCard title="Revenue" value="₹0" />
          <SummaryCard title="Pending Bills" value="0" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <QuickActionCard
          title="➕ Add Customer"
          onPress={() => {}}
        />
        

        <QuickActionCard
          title="🥛 Milk Collection"
          onPress={() => {}}
        />

        <QuickActionCard
          title="🧾 Billing"
          onPress={() => {}}
        />

        <QuickActionCard
          title="📊 Reports"
          onPress={() => {}}
        />

        <QuickActionCard
          title="⚙️ Settings"
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
    color: '#222',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});