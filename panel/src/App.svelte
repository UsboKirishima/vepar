<script lang="ts">
  //@ts-ignore
  import svelteLogo from "./assets/svelte.svg";
  //@ts-ignore
  import viteLogo from "/vite.svg";
  import Counter from "./lib/Counter.svelte";
  import { Panel } from "../services/Panel";

  const panel = new Panel('http://localhost:3000');
</script>

<main class="bg-black h-screen w-screen flex flex-col items-center">
  <h1 class="text-white text-6xl font-extrabold">Vepar Botnet</h1>
</main>
