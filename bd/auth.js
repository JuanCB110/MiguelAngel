import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc
} from './firebase-config.js';

// Función para iniciar sesión
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Obtener datos adicionales del usuario desde Firestore
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const userId = querySnapshot.docs[0].id;
      
      // Guardar info de sesión
      sessionStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        docId: userId,
        name: userData.name,
        role: userData.role
      }));
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userData.name,
          role: userData.role
        }
      };
    } else {
      throw new Error("No se encontraron datos del usuario");
    }
  } catch (error) {
    console.error("Error de inicio de sesión:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para registrar un nuevo usuario
export async function register(name, email, password, role, accountNumber = null) {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Añadir información adicional a Firestore
    const userData = {
      name: name,
      email: email,
      role: role,
      createdAt: new Date(),
      accountNumber: accountNumber
    };
    
    await addDoc(collection(db, "users"), userData);
    
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        role: role
      }
    };
  } catch (error) {
    console.error("Error de registro:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para cerrar sesión
export async function logout() {
  try {
    await signOut(auth);
    sessionStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Verificar si hay una sesión activa
export function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Proteger rutas basadas en roles
export function checkAuth() {
  const user = getCurrentUser();
  
  // Verificación más estricta de que el usuario existe y tiene los campos requeridos
  if (!user || !user.uid || !user.email || !user.role) {
    console.warn('Sesión no válida o expirada. Redirigiendo al login...');
    // Limpiar cualquier dato corrupto de la sesión
    sessionStorage.removeItem('user');
    window.location.href = '../../index.html';
    return null;
  }
  
  return user;
}

// Verificar si el usuario tiene permisos de admin
export function checkAdminAuth() {
  const user = checkAuth();
  if (user && user.role !== 'Administrador') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '../../index.html';
    return null;
  }
  return user;
}

// Verificar si el usuario tiene permisos de coordinador
export function checkCoordinadorAuth() {
  const user = checkAuth();
  if (user && user.role !== 'Coordinador' && user.role !== 'Administrador') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '../../index.html';
    return null;
  }
  return user;
}

// Verificar si el usuario tiene permisos de jefe de grupo
export function checkJefeGrupoAuth() {
  const user = checkAuth();
  if (user && user.role !== 'Jefe de grupo' && user.role !== 'Administrador') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '../../index.html';
    return null;
  }
  return user;
}

// Verificar si el usuario tiene permisos de alumno
export function checkAlumnoAuth() {
  const user = checkAuth();
  if (user && user.role !== 'Alumno' && user.role !== 'Administrador') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '../../index.html';
    return null;
  }
  return user;
}

// Asignar un grupo a un jefe de grupo
export async function asignarJefeGrupo(userId, grupoId, aulaId = null) {
  try {
    // Validar que se proporcionen los valores necesarios
    if (!userId) {
      throw new Error("Se requiere el ID del usuario");
    }
    if (!grupoId) {
      throw new Error("Se requiere el ID del grupo");
    }
    
    console.log(`Asignando grupo ${grupoId} al jefe de grupo ${userId}. Aula: ${aulaId || 'No asignada'}`);
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado");
    }
    
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);
    
    // Creamos un objeto con los campos a actualizar
    const updateData = {
      grupoId: grupoId,
      role: 'Jefe de grupo', // Aseguramos que tenga el rol correcto
      updatedAt: new Date()
    };
    
    // Solo agregamos aulaId si se proporciona un valor
    if (aulaId !== undefined && aulaId !== null) {
      updateData.aulaId = aulaId;
    }
    
    // Actualizamos el documento con los campos definidos
    await updateDoc(userRef, updateData);
    
    return { 
      success: true, 
      message: "Jefe de grupo asignado correctamente" 
    };
  } catch (error) {
    console.error("Error al asignar jefe de grupo:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Obtener todos los jefes de grupo
export async function getJefesGrupo() {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "Jefe de grupo"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener jefes de grupo:", error);
    return [];
  }
}

// Asignar alumno a un grupo específico
export async function asignarAlumnoGrupo(userId, grupoId) {
  try {
    // Primero obtenemos el documento del usuario
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado");
    }
    
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);
    
    // Actualizamos el documento con el ID del grupo
    await updateDoc(userRef, {
      grupoId: grupoId,
      role: 'Alumno', // Aseguramos que tenga el rol correcto
      updatedAt: new Date()
    });
    
    return { 
      success: true, 
      message: "Alumno asignado correctamente" 
    };
  } catch (error) {
    console.error("Error al asignar alumno a grupo:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Obtener todos los alumnos
export async function getAlumnos() {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "Alumno"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return [];
  }
} 

// Obtener un usuario por su userId (usando el ID del documento)
export async function getUserById(userId) {
  try {
    // Obtener la referencia a la colección de usuarios
    const usersRef = collection(db, "users");

    // Obtener el documento con el ID igual a userId
    const docRef = doc(usersRef, userId); // Buscamos el documento cuyo ID es igual a userId
    const docSnap = await getDoc(docRef); // Obtener el documento

    // Verificar si el documento existe
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data() // Devolver los datos del documento
      };
    } else {
      console.log("Usuario no encontrado");
      return null; // Si el documento no existe
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
}

