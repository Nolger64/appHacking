# Guía del Taller de Hacking Ético: Explotación de Criptografía Insuficiente en Aplicaciones Móviles

**Aplicación Objetivo:** AegisPay Private Banking & Encrypted Wealth Vault  
**Plataforma:** React Native con Expo (iOS / Android / Web)  
**Estándares de Referencia:** OWASP Mobile Top 10 (M5: Insufficient Cryptography / M9) • OWASP MASVS-CRYPTO (v2.0) • CWE-327 • CWE-916 • CWE-321 • CWE-328  

---

## 1. Resumen Ejecutivo y Escenario del Taller

En auditorías reales de seguridad móvil, es muy común encontrar aplicaciones financieras o de salud que aprueban superficialmente auditorías iniciales de cumplimiento:
- ✅ Tienen detección de Root y Jailbreak.
- ✅ Cuentan con protección de captura de pantalla y desenfoque al pasar a segundo plano.
- ✅ Bloquean la sesión tras periodos de inactividad.
- ✅ No guardan credenciales en texto plano en almacenamiento local (`AsyncStorage` / `SQLite`).

Sin embargo, los desarrolladores a menudo implementan su propia capa criptográfica para el almacenamiento local sin comprender las debilidades inherentes de los modos de cifrado por bloques o la derivación de claves débiles.

En este taller, los participantes auditarán la aplicación **AegisPay Private Wealth**, identificarán la presencia de **Criptografía Insuficiente**, extraerán el ciphertext del almacenamiento local, realizarán un análisis estático del bundle y desarrollarán un exploit offline que romperá el cifrado en menos de **300 milisegundos**.

---

## 2. Mapa de Vulnerabilidades (OWASP MASVS & CWE)

| Código CWE | Categoría MASVS | Descripción de la Falla en AegisPay |
| :--- | :--- | :--- |
| **CWE-327** | `MASVS-CRYPTO-1` | **Uso de Modo AES-ECB:** La app utiliza *Electronic Codebook (ECB)* sin vector de inicialización (IV). Cada bloque de 16 bytes se cifra de forma idéntica e independiente, filtrando patrones y careciendo de autenticación de integridad (sin tag MAC/GCM). |
| **CWE-916** | `MASVS-CRYPTO-2` | **Derivación de Clave Insuficiente:** Se utiliza PBKDF2 con **1 sola iteración** para derivar la clave AES de 256 bits a partir de un PIN de 4 dígitos. Esto permite probar todo el espacio de búsqueda (0000-9999) en décimas de segundo. |
| **CWE-321** | `MASVS-CRYPTO-2` | **Salt Estático en el Código Fuente:** La constante `APP_VAULT_SALT = "AEGIS_PAY_MOBILE_SALT_2026_PROD"` está quemada directamente en el código JavaScript de la aplicación. |
| **CWE-328** | `MASVS-CRYPTO-1` | **Uso de Hash Débil (MD5):** El PIN se verifica comparando `MD5(pin + salt)`, vulnerable a ataques de preimagen instantáneos con tablas de fuerza bruta. |

---

## 3. Arquitectura de la Aplicación en el Proyecto

- **`src/services/cryptoService.ts`**: Núcleo criptográfico defectuoso. Contiene la derivación PBKDF2 con 1 iteración, el cifrado AES-ECB y el salt estático.
- **`src/services/storageService.ts`**: Gestor de persistencia que interactúa con `@react-native-async-storage/async-storage` guardando las claves `@aegis_encrypted_vault_data` y `@aegis_pin_hash_md5`.
- **`src/screens/UnlockScreen.tsx`**: Pantalla de bloqueo biométrico y teclado numérico de 4 dígitos.
- **`src/screens/HomeScreen.tsx`**: Cuadro de mando financiero (saldos, tarjetas Titanium y transacciones confidenciales).
- **`src/screens/VaultScreen.tsx`**: Bóveda de secretos protegida (tarjetas de crédito completas, frases semilla de criptomonedas y credenciales bancarias).
- **`src/screens/SecurityAuditScreen.tsx`**: Consola interactiva para el taller que permite inspeccionar el volcado de almacenamiento en crudo y probar ataques en vivo.
- **`tools/exploit_vault.py`**: Herramienta en Python para que los estudiantes ejecuten el ataque de fuerza bruta offline desde su terminal.

---

## 4. Guía Práctica de Explotación Paso a Paso (Para Estudiantes)

### Paso 1: Puesta en Marcha de la Aplicación

Para iniciar el servidor de desarrollo Expo y probar la app en navegador web, emulador o Expo Go en tu teléfono:

```bash
# Iniciar el servidor interactivo de Expo
npm start

# O para abrir directamente en la versión Web:
npm run web
```

- Al abrir la app, verás la pantalla de desbloqueo de **Aegis Private Bank**.
- El PIN predeterminado configurado en el laboratorio es **`7492`** (puedes usar el botón *"Autocompletar PIN Demo"*).

---

### Paso 2: Reconocimiento y Análisis de la Postura de Seguridad

1. Ingresa a la aplicación con el PIN `7492`.
2. Dirígete a la pestaña **"Bóveda"** (icono de llave). Observa los datos sensibles almacenados:
   - Tarjeta Black Titanium con PAN completo (`4532 8920 1198 7741`), fecha de expiración y CVV.
   - Frase semilla de billetera fría Trezor con una bandera de formato CTF: `flag{cryp70_3cb_m0d3_15_n07_53cur3}`.
   - Credenciales de transferencia suiza (IBAN / SWIFT / Token).
3. Dirígete a la pestaña **"Auditoría"**.
   - Observa cómo los controles de protección de dispositivo, privacidad de pantalla y biometría están activos, pero el almacenamiento criptográfico marca una alerta MASVS.

---

### Paso 3: Análisis Estático del Código / Bundle

Imagina que has descargado el APK o IPA de la tienda o del dispositivo de la víctima:
1. En React Native, el código de lógica de negocio se empaqueta en el bundle JavaScript (`index.bundle` o `index.android.bundle`).
2. Si un auditor ejecuta una búsqueda de cadenas de texto (utilizando `strings` o inspección de archivos en el bundle):
   ```bash
   grep -i -E "salt|aes|pbkdf2" index.bundle
   ```
3. En el archivo `src/services/cryptoService.ts`, el auditor localiza:
   ```typescript
   export const APP_VAULT_SALT = 'AEGIS_PAY_MOBILE_SALT_2026_PROD';
   
   export function deriveVaultKey(userPin: string) {
     const saltWords = CryptoJS.enc.Utf8.parse(APP_VAULT_SALT);
     return CryptoJS.PBKDF2(userPin, saltWords, {
       keySize: 256 / 32,
       iterations: 1, // <-- VULNERABILIDAD CRÍTICA
       hasher: CryptoJS.algo.SHA1,
     });
   }
   
   export function encryptVaultData(plaintext: string, userPin: string) {
     const key = deriveVaultKey(userPin);
     return CryptoJS.AES.encrypt(plaintext, key, {
       mode: CryptoJS.mode.ECB, // <-- MODO INSEGURO SIN IV
       padding: CryptoJS.pad.Pkcs7,
     }).toString();
   }
   ```

**Hallazgos Clave:**
- El Salt es conocido y estático.
- La función KDF sólo realiza **1 iteración**.
- El espacio de búsqueda está delimitado a un PIN de 4 dígitos: de `0000` a `9999` ($10^4 = 10.000$ posibles claves).
- El cifrado es AES en modo **ECB** (sin IV).

---

### Paso 4: Extracción del Almacenamiento Local (AsyncStorage)

En un dispositivo Android físico o emulado con `adb`, los datos de `@react-native-async-storage` residen en la base de datos SQLite sandboxed de la app:
```bash
adb shell "run-as com.aegispay.vault cat /data/data/com.aegispay.vault/databases/RKStorage"
```

En nuestro taller, para facilitar la práctica en cualquier entorno, puedes extraer el valor directamente desde la pestaña **"Auditoría"**:
1. Busca la sección **"2. Inspector de Almacenamiento (AsyncStorage)"**.
2. Presiona el botón **"Copiar"** junto al **CIPHERTEXT DE LA BÓVEDA** (`@aegis_encrypted_vault_data`).
3. También puedes copiar el **HASH DEL PIN** (`@aegis_pin_hash_md5`).

---

### Paso 5: Explotación Offline con el Script de Fuerza Bruta

Abre tu terminal en la carpeta del proyecto y ejecuta el script `tools/exploit_vault.py`.

#### Opción A: Demostración Rápida
```bash
python tools/exploit_vault.py --demo
```

#### Opción B: Romper el Ciphertext Copiado de la App
Pasa el ciphertext que copiaste en el portapapeles:
```bash
python tools/exploit_vault.py --ciphertext "PEGA_AQUÍ_EL_CIPHERTEXT"
```

#### Opción C: Romper el Hash MD5 del PIN
```bash
python tools/exploit_vault.py --hash "834c87ac6838a6fb8f9d7a5df50d63ae"
```

**Resultado de la Explotación:**
- El script prueba las 10,000 combinaciones posibles de PIN (`0000` a `9999`).
- En menos de **300 milisegundos**, identifica que el PIN `7492` produce un descifrado JSON válido que inicia con `[{"id":"vault-`.
- Recupera el PIN del usuario.
- Vuelca todas las tarjetas de crédito, contraseñas, credenciales bancarias y la bandera del taller:
  `flag{cryp70_3cb_m0d3_15_n07_53cur3}`.

---

## 5. Por Qué Falló la Criptografía (Análisis Técnico)

### 1. El Peligro del Modo ECB (Electronic Codebook)
En el modo ECB, cada bloque de texto plano de 16 bytes se cifra de manera completamente aislada:
$$C_i = E_K(P_i)$$
- **Falta de confidencialidad semántica:** Si dos transacciones o dos tarjetas contienen los mismos primeros 16 bytes (por ejemplo, encabezados JSON idénticos como `{"id":"vault-01"`), sus bloques cifrados correspondientes serán exactamente iguales.
- **Sin vector de inicialización (IV):** Cifrar los mismos datos dos veces con la misma clave resulta exactamente en el mismo texto cifrado.
- **Sin integridad:** ECB no incluye un Código de Autenticación de Mensajes (MAC). Un atacante puede intercambiar bloques cifrados sin ser detectado.

### 2. KDF con 1 Sola Iteración sobre PIN de 4 Dígitos
NIST SP 800-132 y OWASP exigen un mínimo de **600,000 iteraciones** para PBKDF2-HMAC-SHA256 si se deriva una clave de una contraseña/PIN humano, o preferiblemente algoritmos resistentes a memoria como **Argon2id** o **scrypt**.
- Con 1 sola iteración, derivar una clave toma ~0.00002 segundos.
- Probar los 10,000 números posibles toma menos de un parpadeo en cualquier CPU convencional.

---

## 6. Remediación Segura (Cómo Corregirlo Correctamente)

Para cumplir con **OWASP MASVS-CRYPTO v2.0**:

1. **Utilizar el Almacenamiento Seguro Respaldado por Hardware:**
   En React Native y Expo, no se deben almacenar claves de cifrado en código JavaScript ni en AsyncStorage. Se debe utilizar **`expo-secure-store`**:
   - En Android: Utiliza el **Android Keystore** (respaldado por hardware TEE / StrongBox).
   - En iOS: Utiliza el **iOS Keychain** (respaldado por el Secure Enclave).

   ```typescript
   import * as SecureStore from 'expo-secure-store';

   // Guardar secreto con hardware keystore
   await SecureStore.setItemAsync('master_token', sensitiveToken, {
     keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
   });
   ```

2. **Migrar a Cifrado Autenticado (AEAD):**
   - Utilizar **AES-256-GCM** o **ChaCha20-Poly1305**.
   - Generar un vector de inicialización (IV / Nonce) aleatorio y único de 12 o 16 bytes por cada operación de cifrado.
   - Validar el tag de autenticación antes de procesar el texto plano.

3. **Derivación Robusta de Claves:**
   - Si es indispensable derivar de una credencial de usuario, utilizar **Argon2id** o **PBKDF2 con al menos 600,000 iteraciones**.
   - Generar un Salt criptográficamente aleatorio (vía `Crypto.getRandomBytesAsync(32)`) único por cada usuario y almacenarlo por separado.

---

## 7. Preguntas de Discusión para el Taller

1. ¿Por qué agregar detección de Root y Jailbreak no protegió la información de la bóveda contra el análisis offline?
2. Si la aplicación hubiera aumentado el PIN a 6 dígitos (1,000,000 combinaciones), ¿cuánto tiempo habría tardado el ataque? ¿Sigue siendo vulnerable?
3. ¿Cuál es la diferencia entre el cifrado en reposo (MASVS-STORAGE) y el cifrado en tránsito (MASVS-NETWORK)?
