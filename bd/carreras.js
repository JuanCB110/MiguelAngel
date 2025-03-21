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

// Función para obtener todas las carreras
export async function getAllCarreras() {
  try {
    const carrerasSnapshot = await getDocs(collection(db, "carreras"));
    return carrerasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    throw error;
  }
}

// Función para obtener una carrera por ID
export async function getCarreraById(carreraId) {
  try {
    const carreraDoc = await getDoc(doc(db, "carreras", carreraId));
    if (carreraDoc.exists()) {
      return {
        id: carreraDoc.id,
        ...carreraDoc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener carrera por ID:", error);
    throw error;
  }
}

// Función para buscar carrera por nombre
export async function getCarreraByName(nombre) {
  try {
    const q = query(collection(db, "carreras"), where("nombre", "==", nombre));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  } catch (error) {
    console.error("Error al buscar carrera por nombre:", error);
    throw error;
  }
}

// Función para añadir una nueva carrera
export async function addCarrera(carreraData) {
  try {
    const docRef = await addDoc(collection(db, "carreras"), carreraData);
    return { 
      success: true, 
      message: "Carrera añadida correctamente", 
      id: docRef.id 
    };
  } catch (error) {
    console.error("Error al añadir carrera:", error);
    return { success: false, error: error.message };
  }
}

// Función para actualizar una carrera
export async function updateCarrera(carreraId, carreraData) {
  try {
    const carreraRef = doc(db, "carreras", carreraId);
    await updateDoc(carreraRef, carreraData);
    return { success: true, message: "Carrera actualizada correctamente" };
  } catch (error) {
    console.error("Error al actualizar carrera:", error);
    return { success: false, error: error.message };
  }
}

// Función para eliminar una carrera
export async function deleteCarrera(carreraId) {
  try {
    await deleteDoc(doc(db, "carreras", carreraId));
    return { success: true, message: "Carrera eliminada correctamente" };
  } catch (error) {
    console.error("Error al eliminar carrera:", error);
    return { success: false, error: error.message };
  }
} 