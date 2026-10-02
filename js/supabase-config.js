// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

// Esta información es pública y se utiliza
// desde el navegador.
//
// NUNCA colocar aquí:
// - service_role
// - secret key
// - contraseña de la base de datos

const SUPABASE_URL =
    "https://gstndiqwkbjbqltiimtw.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_L9qmx6E6ggcTCyICWeIY0Q_qFYnnfk-";


// ==========================================
// CREAR CLIENTE
// ==========================================

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );