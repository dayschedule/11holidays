import { Hono } from 'hono';
import {
  getOccasions,
  getOccasionById,
  createOccasion,
  updateOccasion,
  deleteOccasion,
} from '../services/occasion.service';
import { Bindings } from '../binding';

const occasions = new Hono<{ Bindings: Bindings }>();

occasions.get('/', async (c) => {
  const { offset = 0, limit = 1000 } = c.req.query();
  const results = await getOccasions(c, Number(offset), Number(limit));
  return c.json(results);
});

occasions.get('/:id', async (c) => {
  const id = c.req.param('id');
  const data = await getOccasionById(c, Number(id));
  if (!data) {
    return c.json({ message: 'No occasion found' }, 400);
  }
  return c.json({ ...data }, 200);
});

occasions.post('/', async (c) => {
  const occasionData = await c.req.json();
  const newOccasionId = await createOccasion(c, occasionData);
  return c.json({ id: newOccasionId }, 201);
});

occasions.put('/:id', async (c) => {
  const id = c.req.param('id');
  const occasionData = await c.req.json();
  const success = await updateOccasion(c, Number(id), occasionData);
  if (success) {
    return c.json({ message: 'Occasion updated successfully' }, 200);
  } else {
    return c.json({ message: `No occasion found: ${id}` }, 404);
  }
});

occasions.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const success = await deleteOccasion(c, Number(id));
  if (success) {
    return c.json({ message: 'Occasion deleted successfully' }, 200);
  } else {
    return c.json({ message: `No occasion found: ${id}` }, 404);
  }
});

export { occasions };