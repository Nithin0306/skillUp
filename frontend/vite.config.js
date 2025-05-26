import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.VITE_BACKEND_API": JSON.stringify(
      process.env.VITE_BACKEND_API
    ),
    "process.env.REACT_APP_API_BASE_URL": JSON.stringify(
      process.env.REACT_APP_API_BASE_URL
    ),
    "process.env.REACT_APP_BACKEND_API": JSON.stringify(
      process.env.REACT_APP_BACKEND_API
    ),
    "process.env.REACT_APP_COURSERA_API_URL": JSON.stringify(
      process.env.REACT_APP_COURSERA_API_URL
    ),
    "process.env.REACT_APP_UDEMY_API_URL": JSON.stringify(
      process.env.REACT_APP_UDEMY_API_URL
    ),
    "process.env.REACT_APP_DEV_API_URL": JSON.stringify(
      process.env.REACT_APP_DEV_API_URL
    ),
    "process.env.REACT_APP_ENVIRONMENT": JSON.stringify(
      process.env.REACT_APP_ENVIRONMENT
    ),
  },
});
