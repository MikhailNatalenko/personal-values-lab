<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Phase1Sorting from '$lib/components/Phase1Sorting.svelte';
	import Top5Selection from '$lib/components/Top5Selection.svelte';
	import CommittedActions from '$lib/components/CommittedActions.svelte';
	import GoalsVision from '$lib/components/GoalsVision.svelte';
	import ResultsSummary from '$lib/components/ResultsSummary.svelte';
	import GlobalTooltip from '$lib/components/GlobalTooltip.svelte';
</script>

<svelte:head>
	<title>Ценности — Тир-лист</title>
</svelte:head>

<MainHeader />

<main>
	{#if appState.currentPhase === 1}
		<Phase1Sorting />
	{:else if appState.currentPhase === 2}
		<Top5Selection
			bind:top5={appState.top5}
			bind:personalDefinitions={appState.personalDefinitions}
			categorizedValues={appState.categorizedCandidates}
			selectedCardId={appState.selectedCardId}
			onDrop={appState.handleTop5Drop}
			moveValueToTop5={appState.moveValueToTop5}
			onRemove={appState.removeFromTop5}
			onFinish={() => appState.goToPhase(3)}
			onBack={() => appState.goToPhase(1)}
			canFinish={appState.canFinishRanking}
			handleDragStart={appState.handleDragStart}
			handleDragOver={appState.handleDragOver}
			onClickValue={appState.selectValue}
		/>
	{:else if appState.currentPhase === 3}
		<CommittedActions
			values={appState.validTop5}
			bind:committedActions={appState.committedActions}
			onBack={() => appState.goToPhase(2)}
			onNext={() => appState.goToPhase(4)}
		/>
	{:else if appState.currentPhase === 4}
		<GoalsVision
			values={appState.validTop5}
			bind:goalsVision={appState.goalsVision}
			onBack={() => appState.goToPhase(3)}
			onFinish={() => appState.goToPhase(5)}
		/>
	{:else if appState.currentPhase === 5}
		<ResultsSummary
			top5={appState.top5}
			personalDefinitions={appState.personalDefinitions}
			committedActions={appState.committedActions}
			goalsVision={appState.goalsVision}
			tiers={appState.tiers}
			onBack={() => appState.goToPhase(4)}
		/>
	{/if}
</main>

<footer>
	<p>© 2026 Тест ценностей. Ваши данные хранятся у Вас локально и никуда не передаются.</p>
</footer>

<GlobalTooltip />

<style>
	main {
		flex: 1;
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
	}

	footer {
		margin-top: auto;
		padding: 2rem 0;
		text-align: center;
		border-top: 1px solid var(--border-light);
		opacity: 0.6;
		font-size: 0.9rem;
	}
</style>
