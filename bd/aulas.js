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

export const getAulaPorId = async (aulaId) => {
    try {
        const docRef = doc(db, "aulas", aulaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            console.log("Aula no encontrada");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener aula por ID:", error);
        throw error;
    }
};

export const getAulaPorNumero = async (numeroAula) => {
    try {
        const q = query(collection(db, 'aulas'), where('numeroAula', '==', numeroAula));
        const querySnapshot = await getDocs(q);
        const aulas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return aulas.length > 0 ? aulas[0] : null;
    } catch (error) {
        console.error('Error al obtener aula por número:', error);
        throw error;
    }
};

export const getAulasPorEdificio = async (edificioId) => {
    try {
        const q = query(collection(db, 'aulas'), where('edificioId', '==', edificioId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener aulas por edificio:', error);
        throw error;
    }
};

export const crearAula = async (aulaData) => {
    try {
        const docRef = await addDoc(collection(db, 'aulas'), {
            ...aulaData,
            createdAt: serverTimestamp()
        });
        return { 
            id: docRef.id, 
            ...aulaData 
        };
    } catch (error) {
        console.error('Error al crear aula:', error);
        throw error;
    }
};

export const actualizarAula = async (aulaId, aulaData) => {
    try {
        const aulaRef = doc(db, 'aulas', aulaId);
        await updateDoc(aulaRef, {
            ...aulaData,
            updatedAt: serverTimestamp()
        });
        console.log("Aula actualizada correctamente:", aulaId);
        return true;
    } catch (error) {
        console.error('Error al actualizar aula:', error);
        throw error;
    }
};

export const eliminarAula = async (aulaId) => {
    try {
        const aulaRef = doc(db, 'aulas', aulaId);
        await deleteDoc(aulaRef);
        console.log("Aula eliminada correctamente:", aulaId);
        return true;
    } catch (error) {
        console.error('Error al eliminar aula:', error);
        throw error;
    }
};

export const verificarDisponibilidadAula = async (aulaId, fecha, horaInicio, horaFin) => {
    try {
        // Aquí iría la lógica para verificar si el aula está ocupada en ese horario
        // Por ejemplo, consultando la colección de horarios o reservas
        
        // Esta es una implementación básica. Deberás adaptarla según la estructura de tu base de datos
        const reservasRef = collection(db, 'reservas');
        const fechaStr = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        const q = query(
            reservasRef,
            where('aulaId', '==', aulaId),
            where('fecha', '==', fechaStr)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Verificar si hay alguna reserva que se solape con el horario solicitado
        for (const doc of querySnapshot.docs) {
            const reserva = doc.data();
            const reservaInicio = reserva.horaInicio;
            const reservaFin = reserva.horaFin;
            
            // Verificar solapamiento
            if (
                (horaInicio >= reservaInicio && horaInicio < reservaFin) ||
                (horaFin > reservaInicio && horaFin <= reservaFin) ||
                (horaInicio <= reservaInicio && horaFin >= reservaFin)
            ) {
                return false; // Aula no disponible en ese horario
            }
        }
        
        return true; // Aula disponible
    } catch (error) {
        console.error('Error al verificar disponibilidad de aula:', error);
        throw error;
    }
}; 