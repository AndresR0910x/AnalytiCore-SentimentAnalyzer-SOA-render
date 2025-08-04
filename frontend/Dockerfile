FROM nginx:alpine

# Copiar los archivos estáticos de la aplicación React al directorio de Nginx
COPY dist /usr/share/nginx/html
# Si usas Create React App, reemplaza "dist" con "build"

# Copiar una configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]