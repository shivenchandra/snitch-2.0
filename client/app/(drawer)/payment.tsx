import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod } from '../../types';
import { getUserPaymentMethods, addPaymentMethod, removePaymentMethod } from '../../services/userService';
import Button from '../../components/ui/Button';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const loadPayments = async () => {
    if (!user) return;
    try {
      const data = await getUserPaymentMethods(user.uid);
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [user])
  );

  const handleSave = async () => {
    if (!user) return;
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Mask the card number to only show last 4 digits
    const last4 = cardNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4.padStart(4, '0')}`;

    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      cardNumber: maskedNumber,
      expiry,
      type: cardNumber.startsWith('4') ? 'Visa' : 'MasterCard', // simple logic
    };

    try {
      await addPaymentMethod(user.uid, newPayment);
      setPayments([...payments, newPayment]);
      setModalVisible(false);
      // Reset form
      setCardNumber('');
      setExpiry('');
      setCvv('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const handleDelete = async (payment: PaymentMethod) => {
    if (!user) return;
    try {
      await removePaymentMethod(user.uid, payment);
      setPayments(payments.filter(p => p.id !== payment.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete payment method');
    }
  };

  const renderItem = ({ item, index }: { item: PaymentMethod; index: number }) => (
    <Animated.View style={styles.cardContainer} entering={FadeInDown.delay(index * 100).duration(400)}>
      <View style={styles.cardHeader}>
        <Ionicons name="card" size={32} color={Colors.textPrimary} />
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardNumber}>{item.cardNumber}</Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Expires</Text>
          <Text style={styles.cardValue}>{item.expiry}</Text>
        </View>
        <Text style={styles.cardType}>{item.type}</Text>
      </View>
    </Animated.View>
  );

  return (
    <AnimatedSafeArea style={styles.container} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>
        ) : payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySub}>
              You haven't added any payment methods yet. Add a card for faster checkout.
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={payments}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.footer}>
              <Button title="Add New Card" onPress={() => setModalVisible(true)} />
            </View>
          </>
        )}
      </View>

      {/* Add Payment Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Card</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} placeholder="1234 5678 9101 1121" keyboardType="numeric" maxLength={16} />
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="MM/YY" maxLength={5} />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput style={styles.input} value={cvv} onChangeText={setCvv} placeholder="123" keyboardType="numeric" maxLength={4} secureTextEntry />
                </View>
              </View>

              <Button title="Save Card" onPress={handleSave} style={{ marginTop: 24 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </AnimatedSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, padding: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  addBtn: {
    marginTop: 24,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: Colors.textPrimary,
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 22,
    color: Colors.textWhite,
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  cardType: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalForm: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
});
