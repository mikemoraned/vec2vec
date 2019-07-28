<script>
  export let stretch = 0.0;

  $: console.log("stretch", stretch);

  function stretchToGrid() {
    stretch = 1.0;
  }
</script>

<style>

</style>

<input
  id="stretch"
  type="range"
  min="0.0"
  max="1.0"
  step="0.01"
  bind:value={stretch}
  style="width: 50%" />
<label for="strength">{stretch}</label>
<button on:click={stretchToGrid}>Stretch to real grid</button>
