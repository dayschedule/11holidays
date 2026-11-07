/** Link to dayschedule.com, tagged so traffic from this site can be measured */
export function dayscheduleUrl(path = '/', params: Record<string, string> = {}) {
  const query = new URLSearchParams({ ...params, utm_source: '11holidays' });
  return `https://dayschedule.com${path}?${query.toString()}`;
}
