// Configuración de Supabase para almacenamiento de archivos
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

// Credenciales de Supabase - DEBES REEMPLAZAR ESTOS VALORES
const supabaseUrl = 'https://senbaixtcyhfjjocdzrx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmJhaXh0Y3loZmpqb2NkenJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjUzNDEsImV4cCI6MjA1ODAwMTM0MX0.bYEsMIDs_uhKBXVE3ZJV4N3-UF7xY3ofTP-4GmlVFDU';

// Inicializar cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }; 