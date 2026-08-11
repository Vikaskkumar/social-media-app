import Feed from "./Feed";

/**
 * Home is intentionally thin — it just mounts the Feed page.
 * All data-fetching, post cards, and sidebar logic live in Feed.jsx.
 */
export default function Home() {
  return <Feed />;
}
