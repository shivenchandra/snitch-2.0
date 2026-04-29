import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Address, PaymentMethod } from '../types';

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().addresses) {
      return docSnap.data().addresses;
    }
    return [];
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
};

export const addAddress = async (userId: string, address: Address): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { addresses: [address] }, { merge: true });
    } else {
      await updateDoc(docRef, {
        addresses: arrayUnion(address)
      });
    }
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const removeAddress = async (userId: string, address: Address): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      addresses: arrayRemove(address)
    });
  } catch (error) {
    console.error('Error removing address:', error);
    throw error;
  }
};

export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().paymentMethods) {
      return docSnap.data().paymentMethods;
    }
    return [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};

export const addPaymentMethod = async (userId: string, paymentMethod: PaymentMethod): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { paymentMethods: [paymentMethod] }, { merge: true });
    } else {
      await updateDoc(docRef, {
        paymentMethods: arrayUnion(paymentMethod)
      });
    }
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const removePaymentMethod = async (userId: string, paymentMethod: PaymentMethod): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      paymentMethods: arrayRemove(paymentMethod)
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error;
  }
};
