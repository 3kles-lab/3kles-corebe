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

### JSON file uploads

The existing JSON and form parsing behavior is preserved. Existing Express,
GenericRouter, SecureRouter and MongoDBRouter declarations need no new parser
middleware. Routers remain native Express routers.

Register a dedicated upload router before the default body parsers with:

```ts
app.addRoute(fileRouter, undefined, { parser: false });
```

This registration preserves the incoming bytes, including `application/json`
files. It takes priority over ordinary router registrations; its own
authentication and authorization middleware must be inside the dedicated router.
Helmet, CORS, logging and metrics still apply.

The third argument also accepts a selected Express parser, replacing the defaults
for that dedicated router. The existing OpenAPI-array argument remains supported:

```ts
app.addRoute(textRouter, 'text', { parser: express.text({ type: 'application/json' }) });
app.addRoute(normalRouter, 'metadata', openApiRoutes);
```

Parsing is configured for the mounted router, not in ServiceParams. Ordinary
routers still use the application `limit` and `extended` options. A file proxy
uses `requestType: 'stream'` as before; that controls forwarding, not body parsing.

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
