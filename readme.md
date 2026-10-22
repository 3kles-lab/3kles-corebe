# 3KLES -COREBE

This package contains interface and class to create Express Application

## API

**IGenericAPI** is an interface with four methods:

- **buildRequest**: Method to build the request api from parameters and data
- **executeRequest**: Method to execute the request
- **processResponse**: Method called to manage response
- **processError**: Method called to manage error response
  
In this module there is a class **HttpApi** that implement **IGenericApi** to manage http/s request protocol.

## App

**IGenericApp** is an interface defined as below:

- **initAppVariable**: Method to init variable (Exemple from dotenv)
- **initModule**: Method to load module
- **initError**: Method to manage error
- **initRoute**: Method to set main router
- **startApp**: Start app with port number

## Router

**IGenericRouter** is an interface defined as below:

- **addController**:Method to add route from controller

### Request body parsers

`GenericApp` retains its default JSON and URL-encoded parsers. Existing routers,
including `TemplateRouter -> MongoDBRouter -> GenericRouter` and plain Express
routers, receive `request.body` before their validation middleware. Existing
services do not need to add `json()` calls. The application `limit` and `extended`
options keep their existing meaning.

A dedicated router can replace or disable these application defaults when it is
registered. The existing OpenAPI-array third argument remains supported:

```ts
import * as bodyParser from 'body-parser';

// Existing routes: keep the application's default parsers.
app.addRoute(templateRouter.router);
app.addRoute(processRouter, 'workflow-processes');

// Dedicated upload router: leave its request streams untouched.
app.addRoute(fileRouter, undefined, { parser: false });

// Dedicated text endpoint: use a selected parser instead of the defaults.
app.addRoute(textRouter, 'text', {
    parser: bodyParser.text({ type: 'application/json', limit: '1mb' }),
});
```

Routers registered with an explicit `parser` run before the application defaults,
after common middleware such as Helmet, CORS, logging and metrics. Their own
authentication and tenant checks remain responsible for access control.
Include required authentication middleware inside that dedicated router: normal
application middleware registered after the parsing stage does not run before it.
This stage is reserved for dedicated endpoints; it takes priority over ordinary
routers. No Express methods, prototypes or routing internals are modified.

For a group of `GenericRouter` routes that needs different parsers, register the
group with `{ parser: false }` at application level. Each route in `ServiceParams`
then selects its incoming parser before validation:

```ts
import * as bodyParser from 'body-parser';
import { ServiceParams } from '@3kles/3kles-corebe';

const routes: ServiceParams = {
    metadata: {
        method: 'POST',
        path: '/metadata',
        // No parser specified: JSON is parsed into request.body.
    },
    upload: {
        method: 'POST',
        path: '/files',
        parser: false, // Preserve the HTTP stream, including application/json files.
    },
    text: {
        method: 'POST',
        path: '/text',
        parser: bodyParser.text(),
    },
    form: {
        method: 'POST',
        path: '/form',
        parser: bodyParser.urlencoded({ extended: true }),
    },
};
```

`parser` accepts an Express `RequestHandler` or `false`. JSON is the default
only when `parser` is omitted. `GenericRouter` and `SecureRouter` apply the
selected parser before route validation middleware and controller execution.
Custom parsers replace the default; `false` does not buffer or parse the body.
Upload handlers remain responsible for authentication and upload size limits.

The route selection is implemented in `AbstractGenericRouter` and applied when
`GenericRouter` or `SecureRouter` registers the route. Parsing is not deferred
to controllers. A parser cannot recover bytes already consumed upstream, so
register a group with `{ parser: false }` whenever its routes need to opt out of
the application defaults. This is required for custom parsers as well as uploads.

Existing subclasses mounted normally in `GenericApp` need no parser changes.
For a new standalone subclass outside `GenericApp`, or a group explicitly exempted
from application parsing, the inherited helper is available before validation:

```ts
this.router.post('/metadata', this.getParserMiddleware(), validateMetadata, saveMetadata);
this.router.post('/files', this.getParserMiddleware(false), receiveFile);
```

A route-level JSON parser uses the application limit unless overridden by the
router options. To use a larger limit than the application defaults, mount that
router with `{ parser: false }` so those defaults do not run first:

```ts
const router = new GenericRouter(controller, {
    mergeParams: true,
    jsonParserOptions: { limit: '1mb' },
});
app.addRoute(router.router, undefined, { parser: false });
```

**Migration from 6.0.0:** remove local JSON parsers added solely to compensate for
the removal of application defaults. Register dedicated streaming/custom-parser
routers through the new `addRoute` options instead of mounting them manually before
`initModule()`. Rebuild consuming libraries such as `coremongodb` when they bundle
corebe, then update the applications. Updating the nested dependency alone does
not replace code already included in a published bundle.

`parser` controls reading the incoming request. For a `GenericService` route
forwarding a file, also set `requestType: 'stream'` to forward those bytes to the
upstream service; this option does not replace `parser: false`.

### Verification

`npm test` runs HTTP tests for the default/custom/disabled parsers, exact upload
bytes, route matching, authentication routes, inherited CRUD routes and full
`GenericApp` integration with health, metrics, common middleware and size limits.
Compatibility tests cover validators in two levels of inherited routers, nested
CRUD routers, plain Express routers, direct application handlers and URL-encoded
forms. Raw uploads are tested after unrelated routers and with a smaller default
JSON limit, including malformed JSON file content and rejected authentication.

## Controller

**IGenericController** is an interface defined as below:

- **execute**: Method to execute request from type
- **setService**:Method to set **IGenericService**
- **getServiceParams**:Method to get service parameters
- **updateParamFromRequest**:Method to update controller parameters from request

## Service

**IGenericService** is an interface defined as below:

- **execute**: Method to execute request from parameters
- **getServiceParams**: Method to get service parameters
