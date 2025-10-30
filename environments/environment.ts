export const environment = {
  production: false,
  // Tous les appels front passent par le gateway Spring Cloud en 8080
  apiBaseUrl: 'http://localhost:8080',
  endpoints: {
    // Routes exposées par le gateway (voir gateway-service.yaml)
    auth: '/users/auth',
    users: '/users/users',
    inscriptions: '/inscription/inscriptions'
  }
};
