import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc,
    getDoc, 
    query, 
    where,
    serverTimestamp
} from './firebase-config.js';

/**
 * Obtiene todos los edificios registrados en la base de datos
 * @returns {Promise<Array>} Array con todos los edificios
 */
export const getEdificios = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'edificios'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener edificios:', error);
        throw error;
    }
};

/**
 * Obtiene un edificio específico por su ID
 * @param {string} edificioId - ID del edificio a buscar
 * @returns {Promise<Object|null>} Datos del edificio o null si no existe
 */
export const getEdificioPorId = async (edificioId) => {
    try {
        const docRef = doc(db, "edificios", edificioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            console.log("Edificio no encontrado");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener edificio por ID:", error);
        throw error;
    }
};

/**
 * Obtiene un edificio por su nombre
 * @param {string} nombreEdificio - Nombre del edificio a buscar
 * @returns {Promise<Object|null>} Datos del edificio o null si no existe
 */
export const getEdificioPorNombre = async (nombreEdificio) => {
    try {
        const q = query(collection(db, 'edificios'), where('nombre', '==', nombreEdificio));
        const querySnapshot = await getDocs(q);
        const edificios = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return edificios.length > 0 ? edificios[0] : null;
    } catch (error) {
        console.error('Error al obtener edificio por nombre:', error);
        throw error;
    }
};

/**
 * Crea un nuevo edificio en la base de datos
 * @param {Object} edificioData - Datos del edificio a crear (nombre, ubicación, etc)
 * @returns {Promise<Object>} Datos del edificio creado incluyendo su ID
 */
export const crearEdificio = async (edificioData) => {
    try {
        const docRef = await addDoc(collection(db, 'edificios'), {
            ...edificioData,
            createdAt: serverTimestamp()
        });
        return { 
            id: docRef.id, 
            ...edificioData 
        };
    } catch (error) {
        console.error('Error al crear edificio:', error);
        throw error;
    }
};

/**
 * Actualiza los datos de un edificio existente
 * @param {string} edificioId - ID del edificio a actualizar
 * @param {Object} edificioData - Nuevos datos para el edificio
 * @returns {Promise<boolean>} True si la actualización fue exitosa
 */
export const actualizarEdificio = async (edificioId, edificioData) => {
    try {
        const edificioRef = doc(db, 'edificios', edificioId);
        await updateDoc(edificioRef, {
            ...edificioData,
            updatedAt: serverTimestamp()
        });
        console.log("Edificio actualizado correctamente:", edificioId);
        return true;
    } catch (error) {
        console.error('Error al actualizar edificio:', error);
        throw error;
    }
};

/**
 * Elimina un edificio de la base de datos
 * @param {string} edificioId - ID del edificio a eliminar
 * @returns {Promise<boolean>} True si la eliminación fue exitosa
 */
export const eliminarEdificio = async (edificioId) => {
    try {
        // Primero verificar si hay aulas asociadas a este edificio
        const aulasRef = collection(db, 'aulas');
        const q = query(aulasRef, where('edificioId', '==', edificioId));
        const aulasSnapshot = await getDocs(q);
        
        if (!aulasSnapshot.empty) {
            throw new Error('No se puede eliminar el edificio porque tiene aulas asociadas');
        }
        
        // Si no hay aulas, proceder con la eliminación
        const edificioRef = doc(db, 'edificios', edificioId);
        await deleteDoc(edificioRef);
        console.log("Edificio eliminado correctamente:", edificioId);
        return true;
    } catch (error) {
        console.error('Error al eliminar edificio:', error);
        throw error;
    }
};

/**
 * Obtiene el número total de aulas en un edificio
 * @param {string} edificioId - ID del edificio
 * @returns {Promise<number>} Número de aulas en el edificio
 */
export const contarAulasPorEdificio = async (edificioId) => {
    try {
        const aulasRef = collection(db, 'aulas');
        const q = query(aulasRef, where('edificioId', '==', edificioId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error al contar aulas por edificio:', error);
        throw error;
    }
}; 