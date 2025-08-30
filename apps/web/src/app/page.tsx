import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import Geofencing from "./_components/Geofencing";




export default async function Home() {
  return (
    <HydrateClient>
      <main>
        {/* <Geofencing/> */}
      </main>
    </HydrateClient>
  );
}
