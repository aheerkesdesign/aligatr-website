import HomePage from "./HomePage";
import { getVenues } from "./lib/venues";

// Re-read /public/venues on each request so dropped logos show up without a rebuild.
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomePage venues={getVenues()} />;
}
