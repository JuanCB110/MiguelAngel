import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from './firebase-config.js';

const materiasRef = collection(db, 'materias');

// Crear una nueva materia
export const crearMateria = async (materia) => {
    try {
        const docRef = await addDoc(materiasRef, materia);
        return { id: docRef.id, ...materia };
    } catch (error) {
        console.error("Error al crear materia:", error);
        throw error;
    }
};

// Obtener todas las materias
export const getMaterias = async () => {
    try {
        const querySnapshot = await getDocs(materiasRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener materias:", error);
        throw error;
    }
};

// Obtener materias por semestre
export const getMateriasPorSemestre = async (semestre) => {
    try {
        const q = query(materiasRef, where("semestre", "==", semestre));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener materias por semestre:", error);
        throw error;
    }
};

// Actualizar una materia
export const updateMateria = async (id, data) => {
    try {
        const materiaRef = doc(db, 'materias', id);
        await updateDoc(materiaRef, data);
        return { id, ...data };
    } catch (error) {
        console.error("Error al actualizar materia:", error);
        throw error;
    }
};

// Eliminar una materia
export const deleteMateria = async (id) => {
    try {
        const materiaRef = doc(db, 'materias', id);
        await deleteDoc(materiaRef);
        return id;
    } catch (error) {
        console.error("Error al eliminar materia:", error);
        throw error;
    }
}; 