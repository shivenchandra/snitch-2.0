import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';

const COLLECTION_NAME = 'orders';

export const placeOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    
    // Sort manually to avoid Firebase requiring a composite index
    return orders.sort((a, b) => b.id.localeCompare(a.id));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], cancelReason?: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const updateData: any = { status };
    if (cancelReason !== undefined) {
      updateData.cancelReason = cancelReason;
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
