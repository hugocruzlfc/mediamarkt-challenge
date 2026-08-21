# Store Apps Platform — Sistema de Gestión de Órdenes

Una aplicación backend que expone una API GraphQL para gestionar órdenes con una máquina de estados estricta. Construida con Node.js/TypeScript, Apollo Server, MongoDB e InversifyJS.

## 🎯 ¿Qué hace?

Gestiona órdenes con un flujo de vida definido:

- **OPEN** → orden creada, lista para procesarse
- **IN_PROGRESS** → asignada a un empleado, en procesamiento
- **COMPLETE** → finalizada

Las transiciones son unidireccionales y estrictas: no se puede saltar estados ni retroceder.

## 🏗️ Arquitectura

### CQRS-lite + DDD + IoC Container

**Tres capas por módulo:**

1. **Domain** (`domain/`) — Entidades puras, reglas de negocio, errores tipados
   - La máquina de estados vive aquí, en `order.entity.ts`
   - Si una regla es violada, lanza un `DomainError` con código estable

2. **Application** (`application/`) — Casos de uso
   - **Commands**: mutaciones (CreateOrder, TransitionOrder)
   - **Queries**: lecturas (GetOrder, ListOrders)
   - Cada handler toma datos, llama al dominio, persiste, devuelve

3. **Infrastructure** (`infrastructure/`) — Técnica, no lógica
   - **Persistence**: Mongoose + MongoDB
   - **GraphQL**: Resolvers + type defs
   - Los resolvers llaman a un handler y mapean errores de dominio a `GraphQLError`s

### Inyección de Dependencias (InversifyJS)

Todos los handlers, repositorios y servicios se registran en `src/container/inversify.config.ts`.
Los resolvers reciben el handler necesario vía constructor injection — nunca inyectan el contenedor entero.

## 📁 Estructura de Carpetas

```
src/
├── config/                    # Configuración (env vars)
├── container/                 # IoC container (InversifyJS)
├── graphql/                   # Esquema y contexto de GraphQL
└── modules/
    └── orders/
        ├── domain/            # Entidad Order, máquina de estados, errores
        ├── application/
        │   ├── commands/      # CreateOrder, TransitionOrder
        │   └── queries/       # GetOrder, ListOrders
        └── infrastructure/
            ├── persistence/   # Mongoose schema, repository
            └── graphql/       # Resolvers, type defs
```

Cada archivo importante tiene un `.explain.md` explicando el porqué de cada decisión.

## 🚀 Desarrollo Local

```bash
# 1. Inicia MongoDB en Docker
docker compose up -d

# 2. Instala dependencias (si es la primera vez)
pnpm install

# 3. Levanta el servidor con hot reload
npm run dev
```

El servidor estará en `http://localhost:4000` con Apollo Explorer para jugar con queries/mutations.

## 🧪 Tests

```bash
npm test              # Jest (12 tests, todos en domain)
npm run typecheck     # TypeScript
npm run build         # Compilación a dist/
```

Los tests se enfocan en el dominio: transiciones válidas/inválidas, regla del empleado, casos extremos.

## 📝 Definición de Hecho

Toda nueva característica debe:

- ✅ Tener tests unitarios para comportamiento válido e inválido
- ✅ Retornar `GraphQLError` con `extensions.code` estable (nunca stack traces)
- ✅ Mantener la lógica de negocio solo en la capa de dominio
- ✅ Pasar `npm test` y `npm run typecheck`

Ver `AGENTS.md` para el rol, reglas de dominio y estándares del proyecto.
Ver `.claude/skills/cqrs-module/SKILL.md` para la receta de agregar nuevos comandos/queries.

## 🔑 Decisiones Arquitectónicas

### ¿Por qué CQRS-lite y no un bus genérico?

Con 2 comandos y 2 queries, un command bus/mediator agrega complejidad sin valor.
Inyección directa de handlers: más simple, igual de testeable.

### ¿Por qué Customer y Employee son value objects, no módulos?

El challenge no pide CRUD de empleados ni clientes.
Incrustados en Order como sub-documentos: menos carpetas, menos IoC bindings, mismo comportamiento.

### ¿Por qué MongoDB + Mongoose?

Requisito del challenge. Mongoose sirve como ORM tipado.
El schema es solo persistencia; la entidad de dominio es la fuente de verdad.

### ¿Por qué Inversify y no otro IoC?

Mature, TypeScript-first, decora con `@injectable()` y `@inject()`, soporte para Symbols como tokens.
Fácil de razonar: ves exactamente qué entra en qué handler.

## 🧠 Flujo de una Mutation

1. **GraphQL Resolver** recibe argumentos del cliente
2. **Mapper** convierte en un Command (DTO)
3. **Handler** toma el Command, carga la entidad del repositorio, llama `entity.transitionTo()`
4. **Entidad** valida la transición; si falla, lanza `DomainError`
5. **Handler** persiste la entidad actualizada
6. **Resolver** mapea errores de dominio a `GraphQLError` con `extensions.code`
7. **Cliente** recibe resultado tipado o error estructurado

## 📚 Archivos de Explicación

Cada archivo importante tiene un `.explain.md` que profundiza en el "por qué":

- `src/config/index.explain.md` — Configuración y env vars
- `src/container/inversify.config.explain.md` — Wiring del IoC
- `src/graphql/schema.explain.md` — Cómo se arma el esquema
- `src/modules/orders/domain/order.entity.explain.md` — La máquina de estados
- `src/modules/orders/infrastructure/persistence/order.repository.explain.md` — Mapping Mongoose ↔ Dominio
- Y muchos más...

Estos archivos **no se commitean** (`.explain.md` está en `.gitignore`); son solo para tu referencia mientras exploras el código.

---
