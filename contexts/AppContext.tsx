

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Store, Product, Sale, Settings, AppContextType, DailyVisitPlan } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { DUMMY_STORES, DUMMY_PRODUCTS } from '../dummyData';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useLocalStorage<Store[]>('stores', []);
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
  const [dailyVisitPlan, setDailyVisitPlan] = useLocalStorage<DailyVisitPlan>('dailyVisitPlan', {});

  useEffect(() => {
    // Populate with dummy data for development if local storage is empty.
    if (stores.length === 0 && products.length === 0) {
      console.log("Initial load: Populating with dummy data for development.");
      setStores(DUMMY_STORES);
      setProducts(DUMMY_PRODUCTS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addStore = (store: Omit<Store, 'id'>) => {
    const newStore = { ...store, id: new Date().toISOString() };
    setStores(prev => [...prev, newStore]);
  };

  const updateStore = (updatedStore: Store) => {
    setStores(prev => prev.map(store => store.id === updatedStore.id ? updatedStore : store));
  };
  
  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(store => store.id !== id));
    // Also remove from daily visit plan
    setDailyVisitPlan(prevPlan => {
      const newPlan = { ...prevPlan };
      Object.keys(newPlan).forEach(dayStr => {
        const dayKey = parseInt(dayStr, 10);
        newPlan[dayKey] = newPlan[dayKey].filter(storeId => storeId !== id);
      });
      return newPlan;
    });
  };

  const bulkAddStores = (newStores: Omit<Store, 'id'>[]) => {
    const storesWithIds = newStores.map((store, i) => ({
      ...store,
      id: `${new Date().toISOString()}-${i}` // Add index to ensure unique ID in fast loops
    }));
    setStores(prev => [...prev, ...storesWithIds]);
  };

  const addProduct = (product: Omit<Product, 'id' | 'isActive'>) => {
    const newProduct = { ...product, id: new Date().toISOString(), isActive: true, targetCoverage: product.targetCoverage || {} };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(product => product.id === updatedProduct.id ? updatedProduct : product));
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, isActive: !product.isActive } : product
      )
    );
  };

  const logSale = (sale: Omit<Sale, 'date'>) => {
    const newSale = { ...sale, date: new Date().toISOString() };
    // For simplicity, we just add the sale. A real app might update quantities.
    setSales(prev => [...prev, newSale]);
  };

  const deleteSale = (storeId: string, productId: string) => {
    // This will remove all sales for a given store/product combo, which fits the checklist model.
    setSales(prev => prev.filter(sale => !(sale.storeId === storeId && sale.productId === productId)));
  };
  
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const backupData = () => {
    const data = {
      stores,
      products,
      sales,
      settings,
      dailyVisitPlan,
      chatHistory: JSON.parse(localStorage.getItem('chatHistory') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-monitor-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Backup data berhasil diunduh!');
  };

  const restoreData = (backupFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Basic validation
        if (data.stores && data.products && data.sales && data.settings && data.dailyVisitPlan && data.chatHistory) {
          localStorage.setItem('stores', JSON.stringify(data.stores));
          localStorage.setItem('products', JSON.stringify(data.products));
          localStorage.setItem('sales', JSON.stringify(data.sales));
          localStorage.setItem('settings', JSON.stringify(data.settings));
          localStorage.setItem('dailyVisitPlan', JSON.stringify(data.dailyVisitPlan));
          localStorage.setItem('chatHistory', JSON.stringify(data.chatHistory));
          
          alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
          window.location.reload();
        } else {
          alert("File backup tidak valid.");
        }
      } catch (error) {
        console.error("Failed to restore data:", error);
        alert("Gagal memulihkan data. Pastikan file backup benar.");
      }
    };
    reader.readAsText(backupFile);
  };
  
  const resetApp = () => {
    if (window.confirm("YAKIN ingin mereset seluruh data aplikasi? SEMUA progres akan hilang dan tidak bisa dibatalkan.")) {
      localStorage.removeItem('stores');
      localStorage.removeItem('products');
      localStorage.removeItem('sales');
      localStorage.removeItem('settings');
      localStorage.removeItem('dailyVisitPlan');
      localStorage.removeItem('chatHistory');
      alert("Aplikasi berhasil direset. Halaman akan dimuat ulang.");
      window.location.reload();
    }
  };
  
  const value = {
    stores,
    addStore,
    updateStore,
    deleteStore,
    bulkAddStores,
    products,
    addProduct,
    updateProduct,
    toggleProductStatus,
    sales,
    logSale,
    deleteSale,
    settings,
    updateSettings,
    dailyVisitPlan,
    setDailyVisitPlan,
    backupData,
    restoreData,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};