import 'dotenv/config';
import { connectMongo } from '../utils/db';
import { EmailModel } from '../models/Email';

async function main() {
	await connectMongo(process.env.MONGO_URI || 'mongodb://localhost:27017/email-tracker');
	const sample = await EmailModel.create({
		uid: 'sample-uid',
		to: 'you@example.com',
		subject: 'Sample seeded email',
		htmlOriginal: '<p>Hello</p>'
	});
	console.log('Seeded email:', sample.uid);
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
