<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog"
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";

  let uploadField: Input;

  $effect(() => {
    
  })
</script>

<AlertDialog.Root>
  <AlertDialog.Trigger class="h-fit">
    <Button class="rounded-full bg-green-800 hover:bg-green-600 text-white">Import CSV</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content class="border-green-200">
    <AlertDialog.Header>
      <AlertDialog.Title>Upload CSV file</AlertDialog.Title>
      <AlertDialog.Description>We will automatically handle the rest.</AlertDialog.Description>
    </AlertDialog.Header>
    <div class="flex flex-col gap-2">
      <label for="upload">Upload file</label>
      <Input 
        id="upload" 
        type="file" 
        placeholder="Upload your csv file here.." 
        accept=".csv"
        bind:this={uploadField}/>
    </div>
    <AlertDialog.Footer>
      <AlertDialog.Cancel class="rounded-full">Cancel</AlertDialog.Cancel>
      <AlertDialog.Action class="rounded-full bg-green-800 hover:bg-green-600 text-white">Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>