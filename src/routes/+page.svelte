<script lang="ts">
  import ImportCsvDialog from "$lib/components/custom/import-csv-dialog.svelte";
</script>

<main class="h-screen w-screen bg-green-50 p-4 flex">
  <div class="w-full h-full bg-white border border-green-200 flex flex-col gap-4 p-6">
    <h1 class="font-bold text-3xl">Welcome to Nexus Broadcast!</h1>
    <div class="flex flex-row w-full h-full border border-green-200 p-4">
      <ImportCsvDialog/>
    </div>
  </div>
</main>