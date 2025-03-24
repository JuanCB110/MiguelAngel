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
            // Convertir las fechas a timestamp de Firestore
            const fechaInicioTimestamp = Timestamp.fromDate(new Date(fechaInicio));
            
            // Ajustar fecha final para incluir todo el día
            const fechaFinAjustada = new Date(fechaFin);
            fechaFinAjustada.setHours(23, 59, 59, 999);
            const fechaFinTimestamp = Timestamp.fromDate(fechaFinAjustada);
            
            console.log("Buscando con fechas:", {
                maestroId,
                fechaInicio: fechaInicioTimestamp,
                fechaFin: fechaFinTimestamp
            });
            
            // Si se proporciona un rango de fechas, filtrar por maestro y rango
            q = query(
                collection(db, 'asistencias'),
                where('maestroId', '==', maestroId),
                where('fecha', '>=', fechaInicioTimestamp),
                where('fecha', '<=', fechaFinTimestamp)
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
        // Convertir fecha a formato adecuado si es necesario
        let fechaQuery = fecha;
        if (typeof fecha === 'string') {
            // Si es un string, convertir a objeto Date
            const fechaObj = new Date(fecha);
            // Y luego a timestamp de Firestore
            fechaQuery = Timestamp.fromDate(fechaObj);
        } else if (fecha instanceof Date) {
            // Si ya es un objeto Date, convertir a timestamp de Firestore
            fechaQuery = Timestamp.fromDate(fecha);
        }
        
        console.log("Buscando asistencias para grupo:", grupoId, "fecha:", fechaQuery);
        
        const q = query(
            collection(db, 'asistencias'),
            where('grupoId', '==', grupoId),
            where('fecha', '==', fechaQuery)
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
        // Asegurarse de que fecha sea un Timestamp
        let fechaAsistencia = asistenciaData.fecha;
        if (!(fechaAsistencia instanceof Timestamp)) {
            if (fechaAsistencia instanceof Date) {
                fechaAsistencia = Timestamp.fromDate(fechaAsistencia);
            } else if (typeof fechaAsistencia === 'string') {
                fechaAsistencia = Timestamp.fromDate(new Date(fechaAsistencia));
            }
        }
        
        // Crear el objeto de datos con la fecha correcta
        const datosNormalizados = {
            ...asistenciaData,
            fecha: fechaAsistencia
        };
        
        console.log("Registrando asistencia con datos:", datosNormalizados);
        
        // Verificar si ya existe una asistencia para ese maestro en esa fecha y hora
        const q = query(
            collection(db, 'asistencias'),
            where('maestroId', '==', datosNormalizados.maestroId),
            where('fecha', '==', datosNormalizados.fecha),
            where('hora', '==', datosNormalizados.hora)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Si ya existe, actualizar en lugar de crear uno nuevo
            const docRef = doc(db, 'asistencias', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
                ...datosNormalizados,
                updatedAt: Timestamp.fromDate(new Date())
            });
            return { id: docRef.id, ...datosNormalizados };
        } else {
            // Si no existe, crear uno nuevo
            const docRef = await addDoc(collection(db, 'asistencias'), {
                ...datosNormalizados,
                createdAt: Timestamp.fromDate(new Date())
            });
            return { id: docRef.id, ...datosNormalizados };
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