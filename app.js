import express from 'express';

// Defining imports
import { router as catIdentify } from './api/identify/identify_router.js';

const app = express();
const port = 8080;

// Routers
app.use('/identify', catIdentify);

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
