// Snitch 2.0 — useProducts Hook (Firestore + Fallback)
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants/products';
import { fetchProductsFromDB } from '../services/productService';

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try fetching from Firestore first
      const firestoreProducts = await fetchProductsFromDB(category);

      if (firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      } else {
        // Fallback to mock data if Firestore is empty
        let data = PRODUCTS;
        if (category && category !== 'All') {
          data = data.filter(p => p.category === category);
        }
        setProducts(data);
      }
    } catch (err) {
      console.warn('Firestore fetch failed, using mock data:', err);
      // Fallback to mock data on error
      let data = PRODUCTS;
      if (category && category !== 'All') {
        data = data.filter(p => p.category === category);
      }
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export default useProducts;
