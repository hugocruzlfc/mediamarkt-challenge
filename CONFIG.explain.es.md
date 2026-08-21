# 🔧 Configuración + Validación de Schema con Zod

## Descripción General

Las variables de entorno se cargan vía `dotenv` y se **validan en tiempo de ejecución usando Zod**. Esto asegura:
- ✅ Seguridad de tipos — no hay conversiones string-a-número a nivel de resolver
- ✅ Errores predecibles — si la config es inválida, la app **falla rápido** con un mensaje claro antes del startup
- ✅ Valores por defecto — no hay hardcoding de defaults esparcidos por el código

## Archivo

`src/config/index.ts` — carga env vars, valida con Zod, exporta el objeto tipado `Config`.

## Schema

```typescript
const configSchema = z.object({
  mongodbUri: z.string()
    .url('MONGODB_URI must be a valid MongoDB connection URL')
    .default('mongodb://localhost:27017/store-app'),
  port: z.coerce.number()
    .int('PORT must be an integer')
    .min(1)
    .max(65535)
    .default(4000),
  nodeEnv: z.enum(['development', 'production', 'test'])
    .default('development'),
});
```

## Características de Zod Utilizadas

| Característica | Razón |
|---|---|
| `.url()` | Valida el formato de la URI de MongoDB (debe ser una URL válida) |
| `.coerce` en number | Convierte string `"4000"` → `4000` (necesario porque env vars son strings) |
| `.int()` | Rechaza decimales como `4000.5` |
| `.min(1).max(65535)` | Rango de puerto válido (no puedes usar puerto 0, no puedes exceder 16-bit) |
| `.enum()` | Restringe a valores conocidos — también genera tipos Enum de TypeScript vía `z.infer<typeof>` |
| `.default()` | Fallback si la env var está ausente |

## Seguridad de Tipos

```typescript
export type Config = z.infer<typeof configSchema>;
```

`z.infer` genera un tipo TypeScript a partir del schema de Zod. No necesitas definir el tipo manualmente — **Zod es la única fuente de verdad**:

```typescript
// Se infiere automáticamente:
type Config = {
  mongodbUri: string;    // obligatorio, garantizado URL válida o default
  port: number;          // garantizado integer, 1–65535
  nodeEnv: 'development' | 'production' | 'test';
};
```

## Manejo de Errores

Si las env vars fallan validación, `loadConfig()` lanza un error antes de que el servidor inicie:

```
❌ Invalid environment variables:
  port: Expected integer, received 'abc'
  mongodbUri: Invalid URL
Configuration validation failed
```

Sin fallos silenciosos, sin errores 500 en prod por una config mala.

## Uso

```typescript
import { loadConfig } from './config/index.js';

const config = loadConfig();
// config.mongodbUri, config.port, config.nodeEnv ahora están completamente tipados
mongoose.connect(config.mongodbUri);
server.listen({ port: config.port });
```

## Archivo de Entorno

`.env.example`:

```bash
# URL válida a MongoDB. Si se omite, toma default localhost:27017
MONGODB_URI=mongodb://localhost:27017/store-app

# Puerto para escuchar (1-65535). Default 4000
PORT=4000

# Entorno de Node: development | production | test. Default development
NODE_ENV=development
```

## Comparación: Antes vs. Después

### ❌ Antes (Validación Manual)

```typescript
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/store-app';
const port = parseInt(process.env.PORT || '4000', 10);
const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];

// ¿Puerto malo? Solo se descubre en tiempo de ejecución
if (Number.isNaN(port)) {
  throw new Error('PORT must be a valid number');  // Oops, demasiado tarde
}
```

### ✅ Después (Zod)

```typescript
const parsed = configSchema.safeParse({
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
});

if (!parsed.success) {
  // Errores agrupados y formateados, falla rápido con contexto
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Configuration validation failed');
}

return parsed.data; // Completamente tipado, garantizado seguro
```

## ¿Por qué Zod?

1. **Footprint mínimo** — 9 KB gzipped (como un paquete npm medio)
2. **Sin decoradores** — a diferencia de class-validator (que necesita reflect-metadata + DI)
3. **Funciona con objetos planos** — no está atado a ningún framework
4. **Mensajes de error legibles** — "Expected string, received number" vs. "bad config"
5. **Inferencia de tipos** — un schema, tanto validación *como* tipos

## En la Entrevista

> "Las variables de entorno son solo strings, así que las valido con Zod al startup. El schema es la única fuente de verdad: define rangos válidos, tiene defaults, y genera tipos TypeScript. Si la config es inválida, la app falla rápido con un mensaje claro en lugar de crashear después en un resolver."

**Por qué impresiona:**
- ✅ Reconoce un problema real (env vars son sin tipo)
- ✅ Elige una librería adecuada (no es overkill)
- ✅ Filosofía fail-fast (config inválida = no iniciar)
- ✅ Type safety desde el boundary (env → TypeScript)

## Recursos

- Docs de Zod: https://zod.dev
- Mejores prácticas de validación: https://zod.dev/?id=coercion
