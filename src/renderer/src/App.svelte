<script lang="ts">
  import { onMount } from 'svelte'

  let files: FileList | null = null
  let isAuthenticated = false
  let isLoading = false

  onMount(() => {
    // Listen for WhatsApp authentication status
    window.electron.ipcRenderer.on('whatsapp-authenticated', (): void => {
      isAuthenticated = true
    })

    window.electron.ipcRenderer.on('whatsapp-auth-failure', (): void => {
      isAuthenticated = false
    })
  })

  async function handleFileUpload(): Promise<void> {
    if (!files || files.length === 0) return

    isLoading = true
    try {
      for (const file of files) {
        const reader = new FileReader()
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          const buffer = e.target?.result as ArrayBuffer
          if (buffer) {
            await window.electron.ipcRenderer.invoke('send-file', {
              name: file.name,
              type: file.type,
              data: buffer
            })
          }
        }
        reader.readAsArrayBuffer(file)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      isLoading = false
      files = null
    }
  }
</script>

<main class="container">
  {#if !isAuthenticated}
    <div class="auth-message">
      <h2>Waiting for WhatsApp Authentication...</h2>
      <p>Please scan the QR code in the terminal to continue</p>
    </div>
  {:else}
    <div class="upload-section">
      <h2>Upload Files to WhatsApp</h2>
      <div class="file-input-container">
        <input type="file" id="file-upload" multiple bind:files disabled={isLoading} />
        <label for="file-upload" class="file-label">
          {#if files && files.length > 0}
            {files.length} file(s) selected
          {:else}
            Choose files
          {/if}
        </label>
      </div>
      <button
        on:click={handleFileUpload}
        disabled={!files || files.length === 0 || isLoading}
        class="upload-button"
      >
        {#if isLoading}
          Uploading...
        {:else}
          Upload Files
        {/if}
      </button>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .auth-message {
    margin-top: 2rem;
  }

  .upload-section {
    margin-top: 2rem;
  }

  .file-input-container {
    margin: 2rem 0;
  }

  input[type='file'] {
    display: none;
  }

  .file-label {
    padding: 0.8rem 1.5rem;
    background-color: white;
    border: 2px solid #25d366;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    transition: all 0.3s;
    color: #25d366;
  }

  .file-label:hover {
    background-color: #f0f9f2;
  }

  .upload-button {
    padding: 0.8rem 1.5rem;
    background-color: #25d366;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .upload-button:hover:not(:disabled) {
    background-color: #1fa952;
  }

  .upload-button:disabled {
    background-color: #92e3ad;
    cursor: not-allowed;
  }
</style>
