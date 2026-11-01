import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to sanitize Firestore document data
const formatDoc = (docSnap) => {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
  };
};

/* ============================================================
   USERS / PROFILES
============================================================ */
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return formatDoc(docSnap);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
};

export const syncUserProfile = async (user, additionalData = {}) => {
  if (!user?.uid) return null;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newProfile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || additionalData.name || user.email?.split('@')[0] || 'User',
      role: additionalData.role || 'ADMIN', // Default first created user to ADMIN
      createdAt: serverTimestamp(),
      ...additionalData
    };
    await setDoc(userRef, newProfile);
    return { id: user.uid, ...newProfile, role: newProfile.role };
  }

  return formatDoc(snap);
};

/* ============================================================
   INVENTORY / PRODUCTS
============================================================ */
export const getFirestoreProducts = async () => {
  try {
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    return snap.docs.map(formatDoc);
  } catch (err) {
    console.error('Firestore getProducts error:', err);
    throw err;
  }
};

export const addFirestoreProduct = async (productData) => {
  try {
    const colRef = collection(db, 'products');
    const docRef = await addDoc(colRef, {
      ...productData,
      isArchived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData, isArchived: false };
  } catch (err) {
    console.error('Firestore addProduct error:', err);
    throw err;
  }
};

export const updateFirestoreProduct = async (id, data) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { id, ...data };
  } catch (err) {
    console.error('Firestore updateProduct error:', err);
    throw err;
  }
};

export const archiveFirestoreProduct = async (id, isArchived = true) => {
  return updateFirestoreProduct(id, { isArchived });
};

/* ============================================================
   CUSTOMERS
============================================================ */
export const getFirestoreCustomers = async () => {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    return snap.docs.map(formatDoc);
  } catch (err) {
    console.error('Firestore getCustomers error:', err);
    throw err;
  }
};

export const addFirestoreCustomer = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...data,
      balance: Number(data.balance || 0),
      points: Number(data.points || 0),
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error('Firestore addCustomer error:', err);
    throw err;
  }
};

/* ============================================================
   SALES & POS
============================================================ */
export const getFirestoreSales = async () => {
  try {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(formatDoc);
  } catch (err) {
    console.error('Firestore getSales error:', err);
    throw err;
  }
};

export const addFirestoreSale = async (saleData) => {
  try {
    const docRef = await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: serverTimestamp()
    });

    // Auto deduct inventory stock in Firestore
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        if (item.productId) {
          const prodRef = doc(db, 'products', item.productId);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
            const currentStock = prodSnap.data().stockQuantity || 0;
            const newStock = Math.max(0, currentStock - (item.quantity || 1));
            await updateDoc(prodRef, {
              stockQuantity: newStock,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    }

    return { id: docRef.id, ...saleData };
  } catch (err) {
    console.error('Firestore addSale error:', err);
    throw err;
  }
};

/* ============================================================
   EXPENSES
============================================================ */
export const getFirestoreExpenses = async () => {
  try {
    const snap = await getDocs(collection(db, 'expenses'));
    return snap.docs.map(formatDoc);
  } catch (err) {
    console.error('Firestore getExpenses error:', err);
    throw err;
  }
};

export const addFirestoreExpense = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...data,
      amount: Number(data.amount || 0),
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error('Firestore addExpense error:', err);
    throw err;
  }
};

/* ============================================================
   SEEDED SAMPLE DATA SYNC TO FIRESTORE
============================================================ */
export const seedInitialFirestoreData = async () => {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      return { success: true, count: productsSnap.size, message: 'Products already exist in Firestore.' };
    }

    const demoProducts = [
      { name: 'Wireless Optical Mouse', sku: 'PROD-W-MOUSE', category: 'Electronics', purchasePrice: 450, sellingPrice: 799, stockQuantity: 28, reorderLevel: 10, unit: 'pcs', isArchived: false },
      { name: 'Mechanical Keyboard RGB', sku: 'PROD-KB-RGB', category: 'Electronics', purchasePrice: 1200, sellingPrice: 2199, stockQuantity: 15, reorderLevel: 8, unit: 'pcs', isArchived: false },
      { name: 'USB-C Fast Cable 65W', sku: 'PROD-CABLE-65W', category: 'Accessories', purchasePrice: 85, sellingPrice: 249, stockQuantity: 60, reorderLevel: 15, unit: 'pcs', isArchived: false },
      { name: 'Executive Ballpoint Pen Box', sku: 'PROD-PEN-BOX', category: 'Stationery', purchasePrice: 120, sellingPrice: 220, stockQuantity: 40, reorderLevel: 10, unit: 'box', isArchived: false },
      { name: 'A4 Copier Paper 75GSM', sku: 'PROD-A4-PAPER', category: 'Stationery', purchasePrice: 210, sellingPrice: 320, stockQuantity: 35, reorderLevel: 12, unit: 'ream', isArchived: false },
      { name: 'Ergonomic Desk Chair', sku: 'PROD-CHAIR-ERGO', category: 'Furniture', purchasePrice: 3800, sellingPrice: 5999, stockQuantity: 6, reorderLevel: 5, unit: 'pcs', isArchived: false }
    ];

    for (const prod of demoProducts) {
      await addDoc(collection(db, 'products'), {
        ...prod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    const demoCustomers = [
      { name: 'Ramesh Traders', phone: '9876543210', email: 'ramesh@traders.in', balance: 1450, points: 120, createdAt: serverTimestamp() },
      { name: 'Pooja General Stores', phone: '9823456789', email: 'pooja@stores.in', balance: 0, points: 340, createdAt: serverTimestamp() }
    ];

    for (const cust of demoCustomers) {
      await addDoc(collection(db, 'customers'), cust);
    }

    return { success: true, count: demoProducts.length, message: 'Successfully seeded sample data into Firestore!' };
  } catch (err) {
    console.error('Seed to Firestore error:', err);
    throw err;
  }
};
