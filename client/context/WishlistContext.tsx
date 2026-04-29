import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from Firebase when user logs in
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const loadFavorites = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().favorites) {
          setFavorites(userDoc.data().favorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) return; // Ignore if not logged in

    // Optimistic UI update
    const isFav = favorites.includes(productId);
    setFavorites(prev => 
      isFav ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    // Sync with Firebase
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, { favorites: [productId] }, { merge: true });
      } else {
        await updateDoc(userDocRef, {
          favorites: isFav ? arrayRemove(productId) : arrayUnion(productId)
        });
      }
    } catch (error) {
      console.error('Error toggling favorite in Firebase:', error);
      // Revert optimistic update on failure
      setFavorites(prev => 
        isFav ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [user, favorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  return (
    <WishlistContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
