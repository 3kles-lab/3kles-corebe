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

Each route in `ServiceParams` can select its incoming body parser:

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

The selection is implemented in `AbstractGenericRouter`. Its default JSON
parser also covers inherited routes that invoke `GenericController.execute()`
directly, including the existing MongoDB CRUD registration pattern. Parsing
is deferred until the selected controller executes, so an unmatched router
(for example health, metrics or another resource) never consumes a later upload.
An explicit route parser, including `false`, disables this deferred fallback.

For a subclass that registers Express routes and validators directly, use the
inherited helper before validation:

```ts
this.router.post('/metadata', this.getParserMiddleware(), validateMetadata, saveMetadata);
this.router.post('/files', this.getParserMiddleware(false), receiveFile);
```

`GenericApp` no longer installs global JSON or URL-encoded body parsers. Its
existing `option.limit` remains the default JSON size limit for mounted routers.
A router may override JSON options without changing normal Express router options:

```ts
new GenericRouter(controller, {
    mergeParams: true,
    jsonParserOptions: { limit: '1mb' },
});
```

**Migration:** routes created with `GenericRouter` or `SecureRouter` retain JSON
parsing by default. Plain Express handlers that relied on `GenericApp` to populate
`request.body` must add their own parser. URL-encoded routes must explicitly
select `bodyParser.urlencoded(...)`; the old application-level `extended` option
is deprecated. Treat these changes as a breaking release for consumers relying
on global parsing. Rebuild consuming libraries against the new corebe version
when they bundle their dependencies, before rebuilding the applications.

`parser` controls reading the incoming request. For a `GenericService` route
forwarding a file, also set `requestType: 'stream'` to forward those bytes to the
upstream service; this option does not replace `parser: false`.

### Verification

`npm test` runs HTTP tests for the default/custom/disabled parsers, exact upload
bytes, route matching, authentication routes, inherited CRUD routes and full
`GenericApp` integration with health, metrics, common middleware and size limits.

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
