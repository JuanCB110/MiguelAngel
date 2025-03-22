import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    Timestamp 
} from './firebase-config.js';

// Obtener todas las asistencias
export const getAsistencias = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'asistencias'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        throw error;
    }
};

// Obtener asistencias por maestro
export const getAsistenciasByMaestroId = async (maestroId, fechaInicio = null, fechaFin = null) => {
    try {
        let q;
        
        if (fechaInicio && fechaFin) {
            // Si se proporciona un rango de fechas, filtrar por maestro y rango
            q = query(
                collection(db, 'asistencias'),
                where('maestroId', '==', maestroId),
                where('fecha', '>=', fechaInicio),
                where('fecha', '<=', fechaFin)
            );
        } else {
            // Si no, solo filtrar por maestro
            q = query(collection(db, 'asistencias'), where('maestroId', '==', maestroId));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener asistencias por maestro:', error);
        throw error;
    }
};

// Obtener asistencias por fecha
export const getAsistenciasPorFecha = async (fecha) => {
    try {
        const q = query(collection(db, 'asistencias'), where('fecha', '==', fecha));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener asistencias por fecha:', error);
        throw error;
    }
};

// Obtener asistencias por maestro y fecha
export const getAsistenciasPorMaestroYFecha = async (maestroId, fecha) => {
    try {
        const q = query(
            collection(db, 'asistencias'),
            where('maestroId', '==', maestroId),
            where('fecha', '==', fecha)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener asistencias por maestro y fecha:', error);
        throw error;
    }
};

// Obtener asistencias por grupo y fecha
export const getAsistenciasPorGrupoYFecha = async (grupoId, fecha) => {
    try {
        const q = query(
            collection(db, 'asistencias'),
            where('grupoId', '==', grupoId),
            where('fecha', '==', fecha)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener asistencias por grupo y fecha:', error);
        throw error;
    }
};

// Registrar nueva asistencia
export const registrarAsistencia = async (asistenciaData) => {
    try {
        // Verificar si ya existe una asistencia para ese maestro en esa fecha y hora
        const q = query(
            collection(db, 'asistencias'),
            where('maestroId', '==', asistenciaData.maestroId),
            where('fecha', '==', asistenciaData.fecha),
            where('hora', '==', asistenciaData.hora)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Si ya existe, actualizar en lugar de crear uno nuevo
            const docRef = doc(db, 'asistencias', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
                ...asistenciaData,
                updatedAt: new Date()
            });
            return { id: docRef.id, ...asistenciaData };
        } else {
            // Si no existe, crear uno nuevo
            const docRef = await addDoc(collection(db, 'asistencias'), {
                ...asistenciaData,
                createdAt: new Date()
            });
            return { id: docRef.id, ...asistenciaData };
        }
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        throw error;
    }
};

// Actualizar asistencia
export const actualizarAsistencia = async (asistenciaId, asistenciaData) => {
    try {
        const asistenciaRef = doc(db, 'asistencias', asistenciaId);
        await updateDoc(asistenciaRef, {
            ...asistenciaData,
            updatedAt: new Date()
        });
        return { id: asistenciaId, ...asistenciaData };
    } catch (error) {
        console.error('Error al actualizar asistencia:', error);
        throw error;
    }
};

// Eliminar asistencia
export const eliminarAsistencia = async (asistenciaId) => {
    try {
        const asistenciaRef = doc(db, 'asistencias', asistenciaId);
        await deleteDoc(asistenciaRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        throw error;
    }
}; 