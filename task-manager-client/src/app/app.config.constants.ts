// החליפי את הכתובת כאן בכתובת שקיבלת מ-Render
const RENDER_URL = 'https://task-manager-api-imbz.onrender.com'; 
const LOCAL_URL = 'http://localhost:3000';

const USE_SERVER = true; 

export const API_BASE_URL = USE_SERVER ? RENDER_URL : LOCAL_URL;