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
  getDocs
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
  if (!user) {
    window.location.href = '../index.html';
    return null;
  }
  return user;
}

// Verificar si el usuario tiene permisos de admin
export function checkAdminAuth() {
  const user = checkAuth();
  if (user && user.role !== 'Administrador') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = '../index.html';
    return null;
  }
  return user;
} 