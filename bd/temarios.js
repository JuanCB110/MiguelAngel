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

import { supabase } from './supabase-config.js';

// Función para obtener todos los temarios
export async function getAllTemarios() {
  try {
    const temariosSnapshot = await getDocs(collection(db, "temario"));
    return temariosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener temarios:", error);
    throw error;
  }
}

// Función para obtener un temario por ID
export async function getTemarioById(temarioId) {
  try {
    const temarioDoc = await getDoc(doc(db, "temario", temarioId));
    if (temarioDoc.exists()) {
      return {
        id: temarioDoc.id,
        ...temarioDoc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener temario por ID:", error);
    throw error;
  }
}

// Función para obtener temario por materia ID (retorna solo uno)
export async function getTemarioPorMateriaId(materiaId) {
  try {
    const q = query(collection(db, "temario"), where("materiaId", "==", materiaId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Devolvemos el primer resultado (asumimos que solo hay uno por materia)
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error("Error al obtener temario por materiaId:", error);
    throw error;
  }
}

// Función para obtener temarios por materia (retorna array)
export async function getTemariosByMateria(materiaId) {
  try {
    const q = query(collection(db, "temario"), where("materiaId", "==", materiaId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener temarios por materia:", error);
    throw error;
  }
}

// Función para subir un temario utilizando Supabase Storage y registrarlo en Firestore
export async function subirTemario(materiaId, archivo, nombreMateria, onProgress = null) {
  try {
    if (!materiaId || !archivo) {
      throw new Error('Se requiere un ID de materia y un archivo para subir el temario');
    }
    
    // Primero verificamos si ya existe un temario para esta materia
    const temarioExistente = await getTemarioPorMateriaId(materiaId);
    
    // Si existe, eliminamos el archivo antiguo de Supabase
    if (temarioExistente && temarioExistente.ruta) {
      try {
        const { error } = await supabase.storage
          .from('temariosfire')
          .remove([temarioExistente.ruta]);
        
        if (error) {
          console.warn("Error al eliminar archivo anterior:", error.message);
        }
      } catch (error) {
        console.warn("Error al eliminar archivo anterior, puede que ya no exista:", error);
      }
    }
    
    // Generamos un nombre de archivo único usando timestamp
    const extension = archivo.name.split('.').pop();
    const timestamp = new Date().getTime();
    const nombreArchivo = `temario_${materiaId}_${timestamp}.${extension}`;
    const ruta = nombreArchivo; // En Supabase no necesitamos la ruta completa
    
    // Subir el archivo a Supabase
    const { data, error: uploadError } = await supabase.storage
      .from('temariosfire')
      .upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percentage = progress.loaded / progress.total;
            onProgress(percentage);
          }
        }
      });
    
    if (uploadError) {
      throw new Error(`Error al subir archivo a Supabase: ${uploadError.message}`);
    }
    
    // Obtener la URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('temariosfire')
      .getPublicUrl(ruta);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    
    const url = urlData.publicUrl;
    
    // Datos para guardar en Firestore
    const temarioData = {
      materiaId,
      nombreMateria,
      nombre: archivo.name,
      tipo: archivo.type,
      tamaño: archivo.size,
      url: url,
      ruta: ruta, // Guardamos la ruta para eliminar el archivo después
      storageProvider: 'supabase', // Para identificar dónde está almacenado
      fechaSubida: new Date(),
    };
    
    // Si ya existe un temario para esta materia, actualizamos el documento
    if (temarioExistente) {
      await updateDoc(doc(db, "temario", temarioExistente.id), temarioData);
      return {
        id: temarioExistente.id,
        ...temarioData
      };
    } else {
      // Si no existe, creamos un nuevo documento
      const docRef = await addDoc(collection(db, "temario"), temarioData);
      return {
        id: docRef.id,
        ...temarioData
      };
    }
  } catch (error) {
    console.error("Error al subir temario:", error);
    throw error;
  }
}

// Función para actualizar un temario (sólo datos, no archivo)
export async function updateTemario(temarioId, temarioData) {
  try {
    const temarioRef = doc(db, "temario", temarioId);
    await updateDoc(temarioRef, temarioData);
    return { success: true, message: "Temario actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar temario:", error);
    throw error;
  }
}

// Función para actualizar un temario (incluyendo archivo)
export async function actualizarTemario(materiaId, archivo) {
  return subirTemario(materiaId, archivo);
}

// Función para eliminar un temario (documento y archivo)
export async function eliminarTemario(materiaId) {
  try {
    // Obtenemos el temario actual
    const temario = await getTemarioPorMateriaId(materiaId);
    
    if (!temario) {
      throw new Error('No se encontró un temario para esta materia');
    }
    
    // Primero intentamos eliminar el archivo de Supabase
    if (temario.ruta) {
      try {
        // Verificar si está en Supabase
        if (temario.storageProvider === 'supabase' || !temario.storageProvider) {
          const { error } = await supabase.storage
            .from('temariosfire')
            .remove([temario.ruta]);
            
          if (error) {
            console.warn("Error al eliminar archivo de Supabase:", error.message);
          }
        }
      } catch (error) {
        console.warn("Error al eliminar archivo, continuando con la eliminación del documento:", error);
      }
    }
    
    // Luego eliminamos el documento de Firestore
    await deleteDoc(doc(db, "temario", temario.id));
    
    return { success: true, message: "Temario eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar temario:", error);
    throw error;
  }
}

// Función para eliminar un temario por ID
export async function deleteTemario(temarioId) {
  try {
    // Primero obtenemos el documento para ver si tiene archivo
    const temarioDoc = await getDoc(doc(db, "temario", temarioId));
    
    if (temarioDoc.exists()) {
      const temarioData = temarioDoc.data();
      
      // Si tiene una ruta de archivo, intentamos eliminar el archivo
      if (temarioData.ruta) {
        try {
          // Verificar si está en Supabase
          if (temarioData.storageProvider === 'supabase' || !temarioData.storageProvider) {
            const { error } = await supabase.storage
              .from('temariosfire')
              .remove([temarioData.ruta]);
              
            if (error) {
              console.warn("Error al eliminar archivo de Supabase:", error.message);
            }
          }
        } catch (error) {
          console.warn("Error al eliminar archivo, continuando con la eliminación del documento:", error);
        }
      }
    }
    
    // Eliminamos el documento
    await deleteDoc(doc(db, "temario", temarioId));
    return { success: true, message: "Temario eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar temario:", error);
    throw error;
  }
} 