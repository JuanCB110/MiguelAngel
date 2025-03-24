import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where 
} from './firebase-config.js';

// Obtener todos los horarios
export const getHorarios = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'horarios'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        throw error;
    }
};

// Obtener horario por grupo
export const getHorarioPorGrupo = async (grupoId) => {
    try {
        const q = query(collection(db, 'horarios'), where('grupoId', '==', grupoId));
        const querySnapshot = await getDocs(q);
        let horarios = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("ID del grupo:", grupoId);
        console.log("Horarios:", horarios);
        
        console.log("Horarios antes de procesar:", JSON.stringify(horarios, null, 2));
        
        // Enriquecer los datos con información de grupos, maestros y materias
        if (horarios.length > 0) {
            // Importamos las funciones necesarias
            const { getGrupoPorId } = await import('./grupos.js');
            const { getMaestroPorId } = await import('./maestros.js');
            const { getMaterias } = await import('./materias.js');
            
            // Obtenemos todos los datos necesarios una sola vez
            const grupo = await getGrupoPorId(grupoId);
            const materias = await getMaterias();
            
            // Procesamos cada horario para añadir información completa
            for (let i = 0; i < horarios.length; i++) {
                // Añadir info del grupo
                if (grupo) {
                    horarios[i].grupo = grupo.numeroGrupo || grupo.nombre;
                }
                
                // Verificar si ya tiene el nombre del maestro
                if (!horarios[i].nombreMaestro && horarios[i].maestroId) {
                    try {
                        const maestro = await getMaestroPorId(horarios[i].maestroId);
                        console.log(`Maestro para horario ${i}:`, maestro);
                        if (maestro) {
                            horarios[i].nombreMaestro = maestro.nombre || maestro.name || `Maestro ${maestro.id}`;
                        }
                    } catch (error) {
                        console.error('Error al obtener maestro:', error);
                    }
                }
                
                // Añadir info de la materia
                if (!horarios[i].materia && horarios[i].materiaId) {
                    const materia = materias.find(m => m.id === horarios[i].materiaId);
                    if (materia) {
                        horarios[i].materia = materia.nombre;
                    }
                }
            }
        }
        
        console.log("Horarios después de procesar:", JSON.stringify(horarios, null, 2));
        return horarios;
    } catch (error) {
        console.error('Error al obtener horario por grupo:', error);
        throw error;
    }
};

// Obtener horario por maestro
export const getHorariosByMaestroId = async (maestroId) => {
    try {
        const q = query(collection(db, 'horarios'), where('maestroId', '==', maestroId));
        const querySnapshot = await getDocs(q);
        let horarios = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log("Horarios antes de procesar para maestro:", JSON.stringify(horarios, null, 2));
        
        // Enriquecer los datos con información de grupos, maestros y materias
        if (horarios.length > 0) {
            // Importamos las funciones necesarias
            const { getGrupoPorId } = await import('./grupos.js');
            const { getMaestroPorId } = await import('./maestros.js');
            const { getMaterias } = await import('./materias.js');
            
            // Obtenemos todos los datos necesarios una sola vez
            const maestro = await getMaestroPorId(maestroId);
            const materias = await getMaterias();
            
            // Procesamos cada horario para añadir información completa
            for (let i = 0; i < horarios.length; i++) {
                // Añadir info del grupo
                if (horarios[i].grupoId) {
                    try {
                        const grupo = await getGrupoPorId(horarios[i].grupoId);
                        if (grupo) {
                            horarios[i].grupo = grupo.numeroGrupo || grupo.nombre;
                        }
                    } catch (error) {
                        console.error('Error al obtener grupo:', error);
                    }
                }
                
                // Añadir info del maestro si no existe
                if (!horarios[i].nombreMaestro && maestro) {
                    horarios[i].nombreMaestro = maestro.nombre || maestro.name || `Maestro ${maestroId}`;
                }
                
                // Añadir info de la materia si no existe
                if (!horarios[i].materia && horarios[i].materiaId) {
                    const materia = materias.find(m => m.id === horarios[i].materiaId);
                    if (materia) {
                        horarios[i].materia = materia.nombre;
                    }
                }
            }
        }
        
        console.log("Horarios después de procesar para maestro:", JSON.stringify(horarios, null, 2));
        return horarios;
    } catch (error) {
        console.error('Error al obtener horario por maestro:', error);
        throw error;
    }
};

// Obtener materia por ID
export const getMateriaById = async (materiaId) => {
    try {
        // Implementar cuando sea necesario
        return { id: materiaId, nombre: 'Materia' };
    } catch (error) {
        console.error('Error al obtener materia por ID:', error);
        throw error;
    }
};

// Crear nuevo horario
export const crearHorario = async (horarioData) => {
    try {
        const docRef = await addDoc(collection(db, 'horarios'), {
            ...horarioData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error al crear horario:', error);
        throw error;
    }
};

// Actualizar horario
export const actualizarHorario = async (horarioId, horarioData) => {
    try {
        const horarioRef = doc(db, 'horarios', horarioId);
        await updateDoc(horarioRef, horarioData);
        return true;
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        throw error;
    }
};

// Eliminar horario
export const eliminarHorario = async (horarioId) => {
    try {
        const horarioRef = doc(db, 'horarios', horarioId);
        await deleteDoc(horarioRef);
        return true;
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        throw error;
    }
}; 