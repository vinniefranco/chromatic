import Home from './routes/Home.svelte';
import Fret from './routes/Fret.svelte';
import Scale from './routes/Scale.svelte';

const routes = {
	"/": Home,
	"/fret/:tuning": Fret,
	"/scale/:tuning/:key/:scale": Scale
};

export default routes;
