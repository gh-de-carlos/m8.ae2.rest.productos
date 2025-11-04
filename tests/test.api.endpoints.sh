#!/bin/bash

# Test script para M8 AE2 REST Server - API de Productos (Endpoints)
# Primero debes tener el servidor corriendo: npm start
# Luego ejecuta este script: chmod +x tests/test.api.endpoints.sh && ./tests/test.api.endpoints.sh
# O usar el script npm: npm test

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
    echo "Por favor, inicia el servidor antes de ejecutar los tests:"
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
echo "[INFO] Procediendo con la suite de tests..."
echo

# Función para embellecer los mensajes del test
print_test_header() {
    local message="$1"
    local max_width=90  # Ancho máximo total
    local blank_prefix="     "
    
    # Calcular longitud del mensaje
    local message_len=${#message}
    local blank_prefix_len=${#blank_prefix}
    
    # Espacio disponible para todo el contenido (excluyendo blank_prefix)
    local content_width=$((max_width - blank_prefix_len))
    
    # Padding mínimo: "=   " + message + "   ="
    local min_padding=8
    
    # Verificar si el mensaje cabe con el padding mínimo
    if [ $((message_len + min_padding)) -gt $content_width ]; then
        # Truncar mensaje si es muy largo
        local max_message_len=$((content_width - min_padding))
        message="${message:0:$max_message_len}"
        message_len=${#message}
    fi
    
    # Calcular espacio total de padding disponible (content_width - message_len)
    local total_padding=$((content_width - message_len))
    
    # Reservar 6 caracteres para espacio mínimo: "=   " y "   ="
    local equals_space=$((total_padding - 6))
    local equals_per_side=$((equals_space / 2))
    local extra_space=$((equals_space % 2))
    
    # Construir prefijo: "=" + equals + "   "
    local prefix="="
    for ((i=0; i<equals_per_side; i++)); do
        prefix+="="
    done
    prefix+="   "
    
    # Construir sufijo: "   " + equals + "="
    local suffix="   "
    for ((i=0; i<equals_per_side; i++)); do
        suffix+="="
    done
    # Agregar espacio extra al lado derecho si es necesario
    if [ $extra_space -eq 1 ]; then
        suffix+="="
    fi
    suffix+="="
    
    # Crear la línea de contenido completa
    local content_line="${prefix}${message}${suffix}"
    local content_len=${#content_line}
    
    # Crear franja azul para coincidir con la longitud exacta del contenido
    local blue_stripe="${blank_prefix}\033[44m$(printf '%*s' $content_len '')\033[0m"
    
    echo -e "$blue_stripe"
    echo -e "${blank_prefix}\033[44m${content_line}\033[0m"
    echo -e "$blue_stripe"
}

# Función para pausar y limpiar pantalla entre tests
pause_and_clear() {
    echo
    read -t 5 -p $'\033[1;5;33mContinuando en 5 segundos... (Enter para continuar inmediatamente)\033[0m '
    clear
}

# Función para ejecutar test con manejo de errores
run_test() {
    local test_num="$1"
    local description="$2"
    local method="$3"
    local endpoint="$4"
    local data="$5"
    
    print_test_header "$test_num. $description"
    
    if [ -n "$data" ]; then
        echo -e "\033[93m→ Enviando: $method $endpoint\033[0m"
        echo -e "\033[93m→ Datos: $data\033[0m"
        echo
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                        -H "Content-Type: application/json" \
                        -d "$data")
    else
        echo -e "\033[93m→ Solicitando: $method $endpoint\033[0m"
        echo
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    # Extraer código de estado HTTP
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    json_response=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    # Mostrar código de estado con colores
    if [[ $http_status =~ ^2[0-9][0-9]$ ]]; then
        echo -e "\033[92m[OK] Estado HTTP: $http_status\033[0m"
    elif [[ $http_status =~ ^4[0-9][0-9]$ ]]; then
        echo -e "\033[93m[WARN] Estado HTTP: $http_status\033[0m"
    else
        echo -e "\033[91m[ERROR] Estado HTTP: $http_status\033[0m"
    fi
    echo
    
    # Formatear y mostrar JSON
    if echo "$json_response" | jq . >/dev/null 2>&1; then
        echo "$json_response" | jq .
    else
        echo -e "\033[91mRespuesta no es JSON válido:\033[0m"
        echo "$json_response"
    fi
    
    pause_and_clear
}

clear
echo
echo -e "\033[93m     ================================================================================="
echo -e "     ===                                                                           ==="
echo -e "     ===           TEST SUITE PARA EL M8 AE2 REST SERVER - PRODUCTOS API           ==="
echo -e "     ===                                                                           ==="
echo -e "     =================================================================================\033[0m"
echo

echo -e "\033[3;93m     Esta suite de pruebas testea automáticamente cada uno de los endpoints disponibles"
echo -e "     en la API de productos a través de múltiples tests."
echo -e
echo -e "     Tras cada request, dispones de 5 segundos para mirar el resultado en detalle y"
echo -e "     luego continuará automáticamente al siguiente endpoint."
echo -e
echo -e "     Si no quieres esperar, simplemente presiona Enter para avanzar.\033[0m"
echo

read -t 10 -p $'\033[1;5mComenzando en 10 segundos... (Enter para continuar inmediatamente)\033[0m '
clear

# -------------------------- 1 --------------------------
run_test "1" "TESTEEMOS EL ENDPOINT RAÍZ (GET /)" "GET" "/"

# -------------------------- 2 --------------------------
run_test "2" "OBTENER TODOS LOS PRODUCTOS (GET /productos)" "GET" "/productos"

# -------------------------- 3 --------------------------
run_test "3" "OBTENER PRODUCTOS CON PAGINACIÓN (GET /productos?limit=3&offset=0)" "GET" "/productos?limit=3&offset=0"

# -------------------------- 4 --------------------------
run_test "4" "FILTRAR POR CATEGORÍA (GET /productos?categoria=electronica)" "GET" "/productos?categoria=electronica"

# -------------------------- 5 --------------------------
run_test "5" "COMBINAR FILTRO Y PAGINACIÓN (GET /productos?categoria=ropa&limit=2&offset=0)" "GET" "/productos?categoria=ropa&limit=2&offset=0"

# -------------------------- 6 --------------------------
run_test "6" "OBTENER PRODUCTO POR ID (GET /productos/1)" "GET" "/productos/1"

# -------------------------- 7 --------------------------
run_test "7" "CREAR NUEVO PRODUCTO (POST /productos)" "POST" "/productos" '{
  "nombre": "Producto de Prueba",
  "precio": 15000,
  "categoria": "test",
  "descripcion": "Producto creado durante las pruebas automáticas"
}'

# -------------------------- 8 --------------------------
run_test "8" "ACTUALIZAR PRODUCTO (PUT /productos/1)" "PUT" "/productos/1" '{
  "nombre": "Producto Actualizado",
  "precio": 20000
}'

# -------------------------- 9 --------------------------
run_test "9" "INTENTAR CREAR PRODUCTO SIN DATOS REQUERIDOS (POST /productos)" "POST" "/productos" '{
  "descripcion": "Producto sin campos obligatorios"
}'

# -------------------------- 10 --------------------------
run_test "10" "INTENTAR OBTENER PRODUCTO INEXISTENTE (GET /productos/999)" "GET" "/productos/999"

# -------------------------- 11 --------------------------
run_test "11" "INTENTAR ACTUALIZAR PRODUCTO INEXISTENTE (PUT /productos/999)" "PUT" "/productos/999" '{
  "nombre": "No existe"
}'

# -------------------------- 12 --------------------------
run_test "12" "ELIMINAR PRODUCTO ESPECÍFICO (DELETE /productos/2)" "DELETE" "/productos/2"

# -------------------------- 13 --------------------------
run_test "13" "INTENTAR ELIMINAR PRODUCTO YA ELIMINADO (DELETE /productos/2)" "DELETE" "/productos/2"

# -------------------------- 14 --------------------------
run_test "14" "VERIFICAR PRODUCTOS DESPUÉS DE ELIMINACIÓN (GET /productos)" "GET" "/productos"

# -------------------------- 15 --------------------------
run_test "15" "CREAR MÚLTIPLES PRODUCTOS PARA PRUEBA DE PURGA" "POST" "/productos" '{
  "nombre": "Producto para Purga 1",
  "precio": 5000,
  "categoria": "test"
}'

# -------------------------- 16 --------------------------
run_test "16" "CREAR SEGUNDO PRODUCTO PARA PURGA" "POST" "/productos" '{
  "nombre": "Producto para Purga 2",
  "precio": 7500,
  "categoria": "test"
}'

# -------------------------- 17 --------------------------
run_test "17" "VERIFICAR PRODUCTOS ANTES DE PURGA (GET /productos)" "GET" "/productos"

# -------------------------- 18 --------------------------
run_test "18" "PURGAR TODOS LOS PRODUCTOS (DELETE /productos/purge)" "DELETE" "/productos/purge"

# -------------------------- 19 --------------------------
run_test "19" "VERIFICAR QUE NO HAY PRODUCTOS DESPUÉS DE PURGA (GET /productos)" "GET" "/productos"

# -------------------------- 20 --------------------------
run_test "20" "INTENTAR PURGAR CUANDO NO HAY PRODUCTOS (DELETE /productos/purge)" "DELETE" "/productos/purge"

echo
echo -e "\033[92m[COMPLETED] ¡SUITE DE PRUEBAS COMPLETADA!\033[0m"
echo -e "\033[93mSe han ejecutado 20 tests cubriendo todos los endpoints de la API.\033[0m"
echo -e "\033[93mRevisa los resultados arriba para verificar el comportamiento esperado.\033[0m"
echo