import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';
const PRODUCTS_COLLECTION = 'products';
export const fetchProductsFromDB = async (category?: string): Promise<Product[]> => {
  try {
    let q;
    if (category && category !== 'All') {
      q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
export const addProductToDB = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};
export const updateProductInDB = async (id: string, data: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};
export const deleteProductFromDB = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
export const seedProducts = async (products: Omit<Product, 'id'>[]): Promise<void> => {
  try {
    for (const product of products) {
      await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...product,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};
