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
  onStatement?: () => void;
};

export default function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onStatement,
}: Props) {
  return (
    <View style={styles.card}>

      <Text style={styles.name}>
        {customer.collectionOrder}. {customer.name}
      </Text>

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

        <TouchableOpacity
          onPress={onStatement}
          style={styles.statementButton}>

          <Icon
            name="file-chart-outline"
            size={20}
            color="#1976D2"
          />

          <Text style={styles.statementText}>
            Statement
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={onEdit}
          style={styles.editButton}>

          <Icon
            name="pencil-outline"
            size={20}
            color="#1976D2"
          />

          <Text style={styles.editText}>
            Edit
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}>

          <Icon
            name="delete-outline"
            size={20}
            color="#D32F2F"
          />

          <Text style={styles.deleteText}>
            Delete
          </Text>

        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },

  info: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  statementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    marginRight: 8,
  },

  statementText: {
    color: '#1976D2',
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    marginRight: 8,
  },

  editText: {
    color: '#1976D2',
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
  },

  deleteText: {
    color: '#D32F2F',
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
  },

});