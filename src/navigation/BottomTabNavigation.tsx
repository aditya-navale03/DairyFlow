import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import CustomerNavigator from './CustomerNavigator'; import MilkCollectionScreen from '../screens/MilkCollection/MilkCollectionScreen';
import BillingScreen from '../screens/Billing/BillingScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type BottomTabParamList = {
    Dashboard: undefined;
    Customers: undefined;
    Collection: undefined;
    Billing: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#1976D2',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let iconName = '';
                    switch (route.name) {
                        case 'Dashboard':
                            iconName = 'home';
                            break;

                        case 'Customers':
                            iconName = 'account';
                            break;

                        case 'Collection':
                            iconName = 'database';
                            break;

                        case 'Billing':
                            iconName = 'receipt';
                            break;

                        case 'Settings':
                            iconName = 'cog-outline';
                            break;

                        default:
                            iconName = 'help-circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Customers" component={CustomerNavigator}/>
            <Tab.Screen name="Collection" component={MilkCollectionScreen} />
            <Tab.Screen name="Billing" component={BillingScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}