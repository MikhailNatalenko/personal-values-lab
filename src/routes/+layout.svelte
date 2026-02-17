<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="app-container">
	{@render children()}
</div>

<style>
	.app-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
