import { Router } from 'express';
import identifyCat from './identifyCat.js';

export const router = Router();


export const identifyCatHandler = async (req, res) => {
	const data = await identifyCat();
	console.log("called")
	console.log(data)
	res.send(data);
}

router.post('/catname', identifyCatHandler);
router.get('/catname', identifyCatHandler);
