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

### Request body parsing

`GenericApp` does not read request bodies. `GenericRouter` and `SecureRouter`
parse JSON/form bodies by default, before the matched endpoint's validators and
controller. Existing service definitions do not need a parser option. The app's
`limit` and `extended` options remain the defaults.

Parsing is configured in the router constructor:

```ts
new GenericRouter(controller); // JSON/form
new GenericRouter(uploadController, { mergeParams: true, parser: false }); // untouched stream
new GenericRouter(xmlController, { parser: xmlParser }); // selected middleware
```

`false` preserves bytes and the original Content-Type, including JSON files; it
does not change the Content-Type to `application/octet-stream`. `requestType:
'stream'` still controls outgoing forwarding independently.

Routers are native Express routers. Subclasses declaring manual endpoints use
`this.bodyParser` before their validation, or mount it on their own path before
registering those endpoints. CRUD integrations must do this in their router
library, so services inheriting those integrations remain unchanged.

Plain Express routers and direct app handlers do not inherit framework parsing.
They can use `createBodyParser()` or their own Express parser explicitly. A mixed
router must register its streaming endpoints before its default parsing middleware,
or attach parsers to individual endpoints. Avoid a JSON parser on a parent router
that also contains raw JSON file uploads: a child cannot restore a consumed stream.

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
