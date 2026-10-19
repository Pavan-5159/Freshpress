import 'dotenv/config';
import app from './app';
import listEndpoints from 'express-list-endpoints';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 FreshPress server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);

  console.log('\n========== REGISTERED ROUTES ==========');
  console.table(listEndpoints(app));
});




