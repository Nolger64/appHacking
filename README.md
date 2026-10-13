# AegisPay Mobile - Laboratorio de Hacking Ético: Criptografía Insuficiente

**Aplicación:** AegisPay Private Banking & Wealth Vault  
**Tecnología:** React Native con Expo (SDK 57) • TypeScript  
**Escenario de Evaluación:** OWASP Mobile Top 10 (M5: Insufficient Cryptography / M9) • OWASP MASVS-CRYPTO v2.0  

---

## 🎯 Objetivo del Proyecto

Esta aplicación fue creada específicamente para un **taller práctico de hacking ético en dispositivos móviles**.

### 🎭 Diseño y Apariencia (Camuflaje Realista)
A nivel visual y funcional, la aplicación **no muestra ninguna referencia a que sea vulnerable, un laboratorio o un CTF**. Cualquier evaluador o profesor que interactúe con la interfaz observará una aplicación financiera de banca privada pulida y aparentemente blindada:
- **Protección contra Root / Modificaciones:** Detección activa de binarios de administración y sandboxing.
- **Protección de Privacidad de Pantalla:** Detección de paso a segundo plano (`AppState`) para ocultar datos y bloquear sesión.
- **Autenticación Biométrica:** Integración con Face ID / Huella digital y teclado de 4 dígitos.
- **Centro de Seguridad y Cumplimiento:** Sección que detalla los controles y certifica que los datos se almacenan bajo *"Cifrado Militar AES-256 en Reposo"*.

---

## ⚠️ La Vulnerabilidad Oculta: Criptografía Insuficiente

A pesar de contar con todos los controles perimetrales, los desarrolladores cometieron fallas críticas en la implementación del módulo criptográfico local ([`src/services/cryptoService.ts`](src/services/cryptoService.ts)):

| Vulnerabilidad | Código CWE | Descripción Técnica |
| :--- | :--- | :--- |
| **Uso de Modo AES-ECB** | **CWE-327 / CWE-329** | Utiliza *Electronic Codebook (ECB)* sin Vector de Inicialización (IV). Bloques idénticos de texto plano producen bloques idénticos de texto cifrado. Carece de autenticación MAC o etiqueta GCM. |
| **KDF con 1 Sola Iteración** | **CWE-916** | La clave AES de 256 bits se deriva del PIN de 4 dígitos usando PBKDF2-HMAC-SHA1 con **1 sola iteración**. El espacio de búsqueda (0000 a 9999 = 10,000 claves) se puede recorrer por completo en menos de 300 ms. |
| **Salt Estático en el Código** | **CWE-321 / CWE-798** | La constante `APP_VAULT_SALT = "AEGIS_PAY_MOBILE_SALT_2026_PROD"` se encuentra hardcodeada en el bundle de la aplicación. |
| **Hash Débil para Validación** | **CWE-328** | La comprobación del PIN se realiza contra `MD5(pin + salt)`, vulnerable a ataques de preimagen instantáneos. |

---

## 🚀 Puesta en Marcha

### Requisitos
- Node.js (v20 o superior)
- Python 3 con la biblioteca `cryptography` instalada (`pip install cryptography`)

### Iniciar la Aplicación Móvil
```bash
# Instalar dependencias si no se ha hecho
npm install

# Iniciar servidor de Expo
npm start

# O ejecutar directamente en versión Web
npm run web

# O en emulador Android / Expo Go
npm run android
```

* **PIN de Acceso Predeterminado:** `7492`

---

## 🕵️ Guía de Explotación Práctica

### Paso 1: Reconocimiento y Extracción de Datos
1. Inicia sesión en la app con el PIN `7492`.
2. Explora la **Bóveda** para observar los datos confidenciales almacenados (Tarjetas Titanium, frase de recuperación de billetera fría Trezor, cuentas suizas).
3. En una auditoría real, el atacante extrae la base de datos local de SQLite / AsyncStorage (`RKStorage`) mediante `adb` o una copia de seguridad local:
   ```bash
   adb shell "run-as com.aegispay.vault cat /data/data/com.aegispay.vault/databases/RKStorage"
   ```
   Allí encontrará los valores de:
   - `@aegis_encrypted_vault_data` (Ciphertext Base64)
   - `@aegis_pin_hash_md5` (Hash MD5 del PIN)

### Paso 2: Análisis Estático del Bundle
Inspeccionando el archivo `index.bundle` de React Native:
```bash
# Búsqueda de constantes criptográficas en el bundle
grep -E "APP_VAULT_SALT|PBKDF2|ECB" index.bundle
```
Se descubre el Salt estático `AEGIS_PAY_MOBILE_SALT_2026_PROD`, que el KDF usa sólo 1 iteración y que el cifrado es AES en modo ECB.

### Paso 3: Ejecución del Ataque Offline
Utiliza el script provisto en [`tools/exploit_vault.py`](tools/exploit_vault.py):

#### Modo Demostración Directa:
```bash
python tools/exploit_vault.py --demo
```

#### Romper Ciphertext Extraído:
```bash
python tools/exploit_vault.py --ciphertext "PEGA_AQUÍ_EL_CIPHERTEXT"
```

#### Romper el Hash MD5:
```bash
python tools/exploit_vault.py --hash "834c87ac6838a6fb8f9d7a5df50d63ae"
```

**Resultado:** En ~300 milisegundos, el script prueba las 10,000 combinaciones, recupera el PIN `7492` y descifra todas las tarjetas de crédito y frases de recuperación de la billetera.

---

## 🛡️ Remediación y Buenas Prácticas (MASVS-CRYPTO)

1. **Almacenamiento Seguro Respaldado por Hardware:** Migrar a `expo-secure-store` para aprovechar el **Android Keystore** y el **iOS Keychain** (claves protegidas en el TEE / Secure Enclave).
2. **Cifrado Autenticado (AEAD):** Reemplazar AES-ECB por **AES-256-GCM** o **ChaCha20-Poly1305** con IV aleatorio de 12 bytes y validación de tag de autenticidad.
3. **Derivación de Clave Robusta:** Utilizar **Argon2id** o PBKDF2 con $\ge 600,000$ iteraciones y salt criptográficamente aleatorio generado por instalación.

---

## 📁 Documentación Adicional
- Para consultar el syllabus didáctico completo con preguntas teóricas y metodología paso a paso, revisa [`WORKSHOP_LAB_GUIDE.md`](WORKSHOP_LAB_GUIDE.md).
