#!/bin/bash

# Script para cargar datos de prueba en la API REST de Productos
# Asegúrate de que el servidor esté corriendo (npm start) antes de ejecutar este script
# Uso: chmod +x tests/test.load.data.sh && ./tests/test.load.data.sh
# O usar el script npm: npm run load-data

BASE_URL="http://localhost:3000"

# Verificar si el servidor está corriendo
echo "==============================================================================="
echo "                     VERIFICANDO ESTADO DEL SERVIDOR"
echo "==============================================================================="
echo

echo "[INFO] Comprobando si el servidor está corriendo en $BASE_URL..."

if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null 2>&1; then
    echo
    echo "[ERROR] El servidor no está corriendo o no responde"
    echo
    echo "Por favor, inicia el servidor antes de cargar datos:"
    echo "  1. Abre una nueva terminal"
    echo "  2. Navega al directorio del proyecto"
    echo "  3. Ejecuta: npm start"
    echo "  4. Espera a que aparezca el mensaje '[OK] Servidor corriendo...'"
    echo "  5. Vuelve a ejecutar este script"
    echo
    echo "==============================================================================="
    exit 1
fi

echo "[OK] Servidor detectado y respondiendo correctamente"
echo

echo "==============================================================================="
echo "               CARGANDO DATOS DE PRUEBA - API REST PRODUCTOS"
echo "==============================================================================="
echo

# Función para mostrar resultado de cada request
show_result() {
    local product_name="$1"
    local response="$2"
    
    echo "→ Producto: $product_name"
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo "  [OK] Creado exitosamente"
        echo "$response" | jq '.data | {id, nombre, precio, categoria}'
    else
        echo "  [ERROR] Falló la creación"
        echo "  $response"
    fi
    echo
}

echo "[INFO] Iniciando carga de 10 productos de prueba..."
echo

# 1. Camiseta Básica
echo "1/10 - Creando Camiseta Básica..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Camiseta Básica",
    "precio": 12000,
    "categoria": "ropa",
    "descripcion": "Camiseta de algodón 100% en varios colores"
  }')
show_result "Camiseta Básica" "$response"

# 2. Pantalón Mezclilla
echo "2/10 - Creando Pantalón Mezclilla..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pantalón Mezclilla",
    "precio": 25000,
    "categoria": "ropa",
    "descripcion": "Pantalón de mezclilla azul clásico"
  }')
show_result "Pantalón Mezclilla" "$response"

# 3. Smartphone Galaxy
echo "3/10 - Creando Smartphone Galaxy..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Smartphone Galaxy",
    "precio": 450000,
    "categoria": "electronica",
    "descripcion": "Teléfono inteligente con pantalla de 6.5 pulgadas"
  }')
show_result "Smartphone Galaxy" "$response"

# 4. Laptop Gamer
echo "4/10 - Creando Laptop Gamer..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gamer",
    "precio": 1200000,
    "categoria": "electronica",
    "descripcion": "Laptop para gaming con tarjeta gráfica dedicada"
  }')
show_result "Laptop Gamer" "$response"

# 5. Mesa de Madera
echo "5/10 - Creando Mesa de Madera..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mesa de Madera",
    "precio": 85000,
    "categoria": "muebles",
    "descripcion": "Mesa de comedor para 4 personas"
  }')
show_result "Mesa de Madera" "$response"

# 6. Silla Ergonómica
echo "6/10 - Creando Silla Ergonómica..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Silla Ergonómica",
    "precio": 95000,
    "categoria": "muebles",
    "descripcion": "Silla de oficina con soporte lumbar"
  }')
show_result "Silla Ergonómica" "$response"

# 7. Balón de Fútbol
echo "7/10 - Creando Balón de Fútbol..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Balón de Fútbol",
    "precio": 18000,
    "categoria": "deportes",
    "descripcion": "Balón oficial tamaño 5"
  }')
show_result "Balón de Fútbol" "$response"

# 8. Raqueta de Tenis
echo "8/10 - Creando Raqueta de Tenis..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Raqueta de Tenis",
    "precio": 75000,
    "categoria": "deportes",
    "descripcion": "Raqueta profesional de tenis"
  }')
show_result "Raqueta de Tenis" "$response"

# 9. Libro de Cocina
echo "9/10 - Creando Libro de Cocina..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Libro de Cocina",
    "precio": 28000,
    "categoria": "libros",
    "descripcion": "Recetas tradicionales mexicanas"
  }')
show_result "Libro de Cocina" "$response"

# 10. Novela Clásica
echo "10/10 - Creando Novela Clásica..."
response=$(curl -s -X POST "$BASE_URL/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Novela Clásica",
    "precio": 15000,
    "categoria": "libros",
    "descripcion": "Edición especial de literatura universal"
  }')
show_result "Novela Clásica" "$response"

echo "==============================================================================="
echo "[COMPLETED] ¡Carga de datos completada!"
echo
echo "Resumen por categorías:"
echo "  • Ropa: 2 productos"
echo "  • Electrónica: 2 productos" 
echo "  • Muebles: 2 productos"
echo "  • Deportes: 2 productos"
echo "  • Libros: 2 productos"
echo
echo "Total: 10 productos cargados"
echo
echo "Para verificar los datos cargados:"
echo "  curl $BASE_URL/productos | jq ."
echo "==============================================================================="