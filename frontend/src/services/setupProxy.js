const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/submit',
    createProxyMiddleware({
      target: 'https://api-submission-service.onrender.com',
      changeOrigin: true,
    })
  );
  app.use(
    '/analyze',
    createProxyMiddleware({
      target: 'https://api-analysis-service-v1.onrender.com',
      changeOrigin: true,
    })
  );
};