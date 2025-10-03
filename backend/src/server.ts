import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes';
import { connectMongo } from './utils/db';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/', router);

const port = Number(process.env.PORT || 4000);

async function start() {
	await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/email-tracker');
	app.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

start().catch(err => {
	console.error(err);
	process.exit(1);
});
