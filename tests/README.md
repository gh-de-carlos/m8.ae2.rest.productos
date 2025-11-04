# Los Tests 🫖☕

Este directorio contiene todos los scripts de prueba para la API REST de Productos.

## Scripts Disponibles

### `/tests/test.api.endpoints.sh`

Suite completa de pruebas para todos los endpoints de la API.

**¿Qué hace?**:
- Prueba todos los endpoints CRUD
- Valida códigos de estado HTTP
- Verifica respuestas JSON
- Prueba casos de error y edge cases
- Ejecuta 20 tests automáticos

**¿Cómo?**:

```bash
# Desde la raíz del proyecto
npm test

# O directamente
./tests/test.api.endpoints.sh
```

### `/tests/test.load.data.sh`

Script para cargar datos de prueba en la API via requests HTTP. Por defecto, cuando se inicializa el servidor con `npm start` crea un ser de registros en la tabla `productos`, pero un caso de uso muy conveniente es cuando has ejecutado la suite completa de tests a los endpoints, lo que termina por eliminar toda la data de la tabla. En este caso, si quisieras seguir probando endpoints, podría ser muy útil.

**¿Qué hace?**:
- Crea 10 productos de ejemplo
- Distribuidos en 5 categorías
- Mismos datos que la inicialización automática de BD
- Útil para testing y desarrollo

**¿Cómo?**:

```bash
# Desde la raíz del proyecto
npm run load-data

# O directamente  
./tests/test.load.data.sh
```

## Prerrequisitos

Para que los tests queden bonitos sería bueno que tengas:
- El **servidor ejecutándose**: `npm start`
- **jq instalado**: Para formateo JSON (hay versiónm para Windows, creo)
- **curl disponible**: Para requests HTTP (funciona en Gitbash para Windows, creo)

## Estructura de Tests

```
tests/
├── test.api.endpoints.sh   # Suite completa de pruebas de endpoints
├── test.load.data.sh       # Carga de datos de prueba
└── README.md              # Este archivo
```

## Notas

- Los dos tests muestran resultados formateados y con colores para practicar codigos ANSI.
- Los scripts son independientes entre sí
- `test.api.endpoints.sh` incluye su propia carga/purga de datos
- `test.load.data.sh` es útil para setup inicial rápido luego de purgar.