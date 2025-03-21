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

// Obtener todos los maestros
export const getMaestros = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        return querySnapshot.docs
            .filter(doc => doc.data().role === 'Maestro')
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    } catch (error) {
        console.error('Error al obtener maestros:', error);
        throw error;
    }
};

// Obtener maestro por ID
export const getMaestroPorId = async (maestroId) => {
    try {
        console.log("Buscando maestro con ID:", maestroId);
        const docSnap = await getDoc(doc(db, 'users', maestroId));
        if (docSnap.exists()) {
            const maestro = {
                id: docSnap.id,
                ...docSnap.data()
            };
            console.log("Maestro encontrado:", maestro);
            
            // Normalizar el nombre
            if (!maestro.nombre && maestro.name) {
                maestro.nombre = maestro.name;
            } else if (!maestro.name && maestro.nombre) {
                maestro.name = maestro.nombre;
            } else if (!maestro.nombre && !maestro.name) {
                // Si no hay nombre o name, usar displayName o alguna propiedad alternativa
                if (maestro.displayName) {
                    maestro.nombre = maestro.displayName;
                    maestro.name = maestro.displayName;
                } else {
                    // Crear un nombre genérico
                    maestro.nombre = `Maestro ${maestro.id}`;
                    maestro.name = `Maestro ${maestro.id}`;
                }
            }
            
            return maestro;
        } else {
            console.log("No se encontró maestro con ID:", maestroId);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener maestro por ID:', error);
        throw error;
    }
};

// Obtener maestro por número de cuenta
export const getMaestroPorCuenta = async (numeroCuenta) => {
    try {
        const q = query(collection(db, 'maestros'), where('numeroCuenta', '==', numeroCuenta));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))[0];
    } catch (error) {
        console.error('Error al obtener maestro por número de cuenta:', error);
        throw error;
    }
};

// Crear nuevo maestro
export const crearMaestro = async (maestroData) => {
    try {
        // Asegurarse de que el rol sea 'Maestro'
        const data = {
            ...maestroData,
            role: 'Maestro',
            createdAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'users'), data);
        return docRef.id;
    } catch (error) {
        console.error('Error al crear maestro:', error);
        throw error;
    }
};

// Actualizar maestro
export const actualizarMaestro = async (maestroId, maestroData) => {
    try {
        const maestroRef = doc(db, 'users', maestroId);
        await updateDoc(maestroRef, maestroData);
        return true;
    } catch (error) {
        console.error('Error al actualizar maestro:', error);
        throw error;
    }
};

// Eliminar maestro
export const eliminarMaestro = async (maestroId) => {
    try {
        const maestroRef = doc(db, 'users', maestroId);
        await deleteDoc(maestroRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar maestro:', error);
        throw error;
    }
}; 