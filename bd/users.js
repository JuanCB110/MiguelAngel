import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from './firebase-config.js';

import { register } from './auth.js';

// Función para obtener todos los usuarios
export async function getAllUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}

// Función para buscar usuario por número de cuenta
export async function getUserByAccountNumber(accountNumber) {
  try {
    const q = query(collection(db, "users"), where("accountNumber", "==", accountNumber));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  } catch (error) {
    console.error("Error al buscar usuario por número de cuenta:", error);
    throw error;
  }
}

// Función para añadir un nuevo usuario
export async function addUser(userData) {
  try {
    // Primero registrar en Auth
    const result = await register(
      userData.name,
      userData.email,
      userData.password,
      userData.role,
      userData.accountNumber
    );
    
    if (result.success) {
      return { success: true, message: "Usuario creado correctamente" };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error al añadir usuario:", error);
    return { success: false, error: error.message };
  }
}

// Función para actualizar información de usuario
export async function updateUser(userId, userData) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, userData);
    return { success: true, message: "Usuario actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: error.message };
  }
}

// Función para eliminar usuario
export async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, "users", userId));
    return { success: true, message: "Usuario eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return { success: false, error: error.message };
  }
} 