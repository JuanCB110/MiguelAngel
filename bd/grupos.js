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
    where 
} from './firebase-config.js';

// GRUPOS
// Obtener todos los grupos
export const getGrupos = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'grupos'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener grupos:', error);
        throw error;
    }
};

// Obtener grupo por ID (usando el ID del documento directamente)
export const getGrupoPorId = async (grupoId) => {
    try {
      // Obtener la referencia del documento con el ID igual a grupoId
      const docRef = doc(db, "grupos", grupoId); // Obtener el documento con el ID proporcionado
      const docSnap = await getDoc(docRef); // Obtener el documento

      // Verificar si el documento existe
    if (docSnap.exists()) {
        return {
        id: docSnap.id,
          ...docSnap.data() // Devolver los datos del documento
        };
    } else {
        console.log("Grupo no encontrado");
        return null; // Si el documento no existe
    }
    } catch (error) {
    console.error("Error al obtener grupo por ID:", error);
    throw error;
    }
};

// Obtener grupo por número de grupo
export const getGrupoPorNumero = async (numeroGrupo) => {
    try {
        const q = query(collection(db, 'grupos'), where('numeroGrupo', '==', numeroGrupo));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))[0];
    } catch (error) {
        console.error('Error al obtener grupo por número:', error);
        throw error;
    }
};

// Crear nuevo grupo
export const crearGrupo = async (grupoData) => {
    try {
        const docRef = await addDoc(collection(db, 'grupos'), {
            ...grupoData,
            createdAt: new Date()
        });
        return { id: docRef.id, ...grupoData };
    } catch (error) {
        console.error('Error al crear grupo:', error);
        throw error;
    }
};

// Actualizar grupo
export const actualizarGrupo = async (grupoId, grupoData) => {
    try {
        const grupoRef = doc(db, 'grupos', grupoId);
        await updateDoc(grupoRef, grupoData);
        return true;
    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        throw error;
    }
};

// Eliminar grupo
export const eliminarGrupo = async (grupoId) => {
    try {
        const grupoRef = doc(db, 'grupos', grupoId);
        await deleteDoc(grupoRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        throw error;
    }
};

// AULAS
// Obtener todas las aulas
export const getAulas = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'aulas'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener aulas:', error);
        throw error;
    }
};

// Crear nueva aula
export const crearAula = async (aulaData) => {
    try {
        const docRef = await addDoc(collection(db, 'aulas'), {
            ...aulaData,
            createdAt: new Date()
        });
        return { id: docRef.id, ...aulaData };
    } catch (error) {
        console.error('Error al crear aula:', error);
        throw error;
    }
};

// Eliminar aula
export const eliminarAula = async (aulaId) => {
    try {
        const aulaRef = doc(db, 'aulas', aulaId);
        await deleteDoc(aulaRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar aula:', error);
        throw error;
    }
};

// EDIFICIOS
// Obtener todos los edificios
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

// Crear nuevo edificio
export const crearEdificio = async (edificioData) => {
    try {
        const docRef = await addDoc(collection(db, 'edificios'), {
            ...edificioData,
            createdAt: new Date()
        });
        return { id: docRef.id, ...edificioData };
    } catch (error) {
        console.error('Error al crear edificio:', error);
        throw error;
    }
};

// Eliminar edificio
export const eliminarEdificio = async (edificioId) => {
    try {
        const edificioRef = doc(db, 'edificios', edificioId);
        await deleteDoc(edificioRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar edificio:', error);
        throw error;
    }
}; 