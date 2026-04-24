import { apiSuccess } from '@/lib/api-response';
import { listCities } from '@/lib/queries';

export async function GET() {
  const cities = await listCities();
  return apiSuccess(cities);
}
