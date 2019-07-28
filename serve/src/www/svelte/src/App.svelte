<script>
  export let strength;

  $: console.log("strength", strength);

  function stretchToGrid() {
    strength = 1.0;
  }
</script>

<style>

</style>

<input
  id="strength"
  type="range"
  min="0.0"
  max="1.0"
  step="0.01"
  bind:value={strength}
  style="width: 50%" />
<label for="strength">{strength}</label>

<button on:click={stretchToGrid}>Stretch to real grid</button>
