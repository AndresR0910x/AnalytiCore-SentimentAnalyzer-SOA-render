
# AnalytiCore - Prototipo SOA en la Nube

Este proyecto es un prototipo funcional de una arquitectura orientada a servicios (SOA) desplegada en la nube con Render. La plataforma **AnalytiCore** permite a los usuarios enviar textos para realizar un análisis de sentimiento y extraer palabras clave. Está diseñado como una prueba de concepto para validar la viabilidad técnica de una arquitectura políglota (usando diferentes lenguajes de programación) con separación clara de responsabilidades.

---

## 🧩 Componentes del Sistema

El sistema está compuesto por tres servicios independientes, cada uno ejecutándose en su propio contenedor Docker:

### 1. `frontend/` (React + Nginx)
- Aplicación de una sola página (SPA).
- Permite a los usuarios enviar texto para análisis.
- Consulta periódicamente el estado del trabajo.

### 2. `python-service/` (FastAPI o Flask)
- Recibe solicitudes del frontend.
- Valida y guarda los datos en la base de datos.
- Orquesta el análisis llamando al servicio Java.
- Exposición mediante una API RESTful.

### 3. `java-service/` (Spring Boot)
- Servicio “worker” que ejecuta el análisis del texto.
- Actualiza el estado del trabajo en la base de datos.
- Exposición mediante una API RESTful interna.

---

## 🔄 Flujo de Datos

1. **Usuario → Frontend**: El usuario ingresa el texto y lo envía.
2. **Frontend → Python-Service**: El texto es enviado al backend que crea un trabajo en estado `PENDIENTE`, inicia el análisis y retorna un `jobId`.
3. **Python-Service → Java-Service**: Se invoca internamente el análisis de texto.
4. **Java-Service → PostgreSQL**: Procesa el análisis y actualiza el trabajo a `COMPLETADO`.
5. **Frontend → Python-Service**: Consulta periódica del estado y recuperación de resultados por `jobId`.

---

## ☁️ Despliegue en la Nube (Render)

Cada componente está empaquetado como un contenedor Docker y desplegado de forma independiente en Render, garantizando una arquitectura escalable y desacoplada. La base de datos PostgreSQL es gestionada directamente por Render.

---

## 🔧 Tecnologías Utilizadas

| Componente        | Tecnología         |
|-------------------|--------------------|
| Frontend          | React + Nginx      |
| Backend (API)     | Python (FastAPI o Flask) |
| Worker de análisis| Java (Spring Boot) |
| Base de Datos     | PostgreSQL         |
| Contenedores      | Docker             |
| Plataforma Cloud  | Render             |

---

## ✅ Características de la Arquitectura

- **SOA (Service-Oriented Architecture)**: Separación clara de servicios con responsabilidades únicas.
- **Políglota**: Uso de diferentes lenguajes según la fortaleza de cada tecnología.
- **Stateless Services**: Todo el estado está externalizado a la base de datos.
- **APIs RESTful**: Comunicación limpia y estándar entre componentes.
- **Escalabilidad**: Cada servicio puede escalarse de forma independiente.

---

## 📂 Estructura del Repositorio

