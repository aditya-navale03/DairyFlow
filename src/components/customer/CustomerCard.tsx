import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Customer} from '../../types/customer';

type Props = {
  customer: Customer;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CustomerCard({
  customer,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{customer.name}</Text>

      <Text style={styles.info}>
        📞 {customer.mobile}
      </Text>

      <Text style={styles.info}>
        🏠 {customer.village}
      </Text>

      <Text style={styles.info}>
        🥛 ₹{customer.rate}/L
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Icon
            name="pencil"
            size={22}
            color="#1976D2"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={{marginLeft: 20}}>
          <Icon
            name="delete"
            size={22}
            color="#D32F2F"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  info: {
    fontSize: 15,
    marginBottom: 5,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
});