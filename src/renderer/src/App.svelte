<script lang="ts">
  import { onMount } from 'svelte'

  let files: FileList | null = null
  let isAuthenticated = false
  let isLoading = false
  // biome-ignore lint/style/useConst: <explanation>
  let message = ''
  let results: Array<{ name: string; phone: string; status: string; error?: string }> = []

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
    if (!files || files.length === 0 || !message.trim()) return

    isLoading = true
    try {
      const file = files[0] // Only process first file
      const reader = new FileReader()

      reader.onload = async (e: ProgressEvent<FileReader>): Promise<void> => {
        const buffer = e.target?.result as ArrayBuffer
        if (buffer) {
          const response = await window.electron.ipcRenderer.invoke('process-csv', {
            data: buffer,
            message: message.trim()
          })

          if (response.success) {
            results = response.results
          } else {
            console.error('Error:', response.error)
          }
        }
      }

      reader.readAsArrayBuffer(file)
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
      <h2>Mass Message Sender</h2>

      <div class="message-input">
        <textarea bind:value={message} placeholder="Enter your message here..." disabled={isLoading}
        ></textarea>
      </div>

      <div class="file-input-container">
        <input type="file" id="file-upload" accept=".csv" bind:files disabled={isLoading} />
        <label for="file-upload" class="file-label">
          {#if files && files.length > 0}
            {files[0].name}
          {:else}
            Choose CSV file
          {/if}
        </label>
      </div>

      <button
        on:click={handleFileUpload}
        disabled={!files || files.length === 0 || !message.trim() || isLoading}
        class="upload-button"
      >
        {#if isLoading}
          Sending Messages...
        {:else}
          Send Messages
        {/if}
      </button>

      {#if results.length > 0}
        <div class="results">
          <h3>Results</h3>
          <div class="results-grid">
            {#each results as result}
              <div class="result-item {result.status}">
                <strong>{result.name}</strong>
                <span>{result.phone}</span>
                <span class="status">{result.status}</span>
                {#if result.error}
                  <span class="error">{result.error}</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
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

  .message-input {
    margin: 2rem 0;
  }

  textarea {
    width: 100%;
    min-height: 100px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
  }

  .results {
    margin-top: 2rem;
    text-align: left;
  }

  .results-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  .result-item {
    padding: 1rem;
    border-radius: 4px;
    display: grid;
    gap: 0.5rem;
  }

  .result-item.success {
    background-color: #e8f5e9;
    border: 1px solid #81c784;
  }

  .result-item.failed {
    background-color: #ffebee;
    border: 1px solid #e57373;
  }

  .status {
    font-weight: bold;
    text-transform: capitalize;
  }

  .error {
    color: #d32f2f;
    font-size: 0.9em;
  }
</style>
