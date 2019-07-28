<script>
  import { stretch } from "./stores.js";

  function stretchToGrid() {
    stretch.update(s => 1.0);
  }
</script>

<style>

</style>

<div>
  <input
    id="stretch"
    type="range"
    min="0.0"
    max="1.0"
    step="0.01"
    bind:value={$stretch}
    style="width: 50%" />

  <label for="strength">{$stretch}</label>
  <button on:click={stretchToGrid}>Stretch to real grid</button>

</div>
