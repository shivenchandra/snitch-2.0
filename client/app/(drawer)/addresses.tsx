import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { Address } from '../../types';
import { getUserAddresses, addAddress, removeAddress } from '../../services/userService';
import Button from '../../components/ui/Button';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const data = await getUserAddresses(user.uid);
      setAddresses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAddresses();
    }, [user])
  );

  const handleSave = async () => {
    if (!user) return;
    if (!street || !city || !state || !zip) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      street,
      city,
      state,
      zip,
      isDefault: addresses.length === 0, // First address is default
    };

    try {
      await addAddress(user.uid, newAddress);
      setAddresses([...addresses, newAddress]);
      setModalVisible(false);
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setZip('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleDelete = async (address: Address) => {
    if (!user) return;
    try {
      await removeAddress(user.uid, address);
      setAddresses(addresses.filter(a => a.id !== address.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  const renderItem = ({ item, index }: { item: Address; index: number }) => (
    <Animated.View style={styles.addressCard} entering={FadeInDown.delay(index * 100).duration(400)}>
      <View style={styles.addressInfo}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressType}>{item.isDefault ? 'Default' : 'Other'}</Text>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.addressText}>{item.street}</Text>
        <Text style={styles.addressText}>{item.city}, {item.state} {item.zip}</Text>
      </View>
    </Animated.View>
  );

  return (
    <AnimatedSafeArea style={styles.container} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySub}>
              You haven't saved any delivery addresses yet. Add one to make checkout faster.
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={addresses}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.footer}>
              <Button title="Add New Address" onPress={() => setModalVisible(true)} />
            </View>
          </>
        )}
      </View>

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Address</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="123 Main St" />
              
              <Text style={styles.inputLabel}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="New York" />
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="NY" />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="10001" keyboardType="numeric" />
                </View>
              </View>

              <Button title="Save Address" onPress={handleSave} style={{ marginTop: 24 }} />
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
  addressCard: {
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
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
