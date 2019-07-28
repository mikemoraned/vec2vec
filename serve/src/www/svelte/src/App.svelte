<script>
  import GridStretch from "./GridStretch.svelte";

  import { json } from "d3-fetch";

  json("/layout.json").then(function(data) {
    console.log(data);
  });
</script>

<style>

</style>

<GridStretch />
