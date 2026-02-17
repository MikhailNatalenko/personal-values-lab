<script lang="ts">
	import { fade } from 'svelte/transition';
	import TierRow from '$lib/components/TierRow.svelte';
	import ValueCard from '$lib/components/ValueCard.svelte';
	import Top5Selection from '$lib/components/Top5Selection.svelte';
	import CommittedActions from '$lib/components/CommittedActions.svelte';
	import GoalsVision from '$lib/components/GoalsVision.svelte';
	import ResultsSummary from '$lib/components/ResultsSummary.svelte';
	import { values as initialValues } from '$lib/values';

	interface Value {
		id: string;
		name: string;
		description: string;
	}

	interface Tier {
		label: string;
		color: string;
		values: Value[];
	}

	let tiers = $state<Tier[]>([
		{ label: 'S', color: '#ff7f7f', values: [] },
		{ label: 'A', color: '#ffbf7f', values: [] },
		{ label: 'B', color: '#ffff7f', values: [] },
		{ label: 'C', color: '#7fff7f', values: [] }
	]);

	let pool = $state<Value[]>([...initialValues]);
	let showHelp = $state(false);
	let currentPhase = $state(1); // 1-4 Steps, 5 Summary
	let top5 = $state<(Value | null)[]>([null, null, null, null, null]);
	let personalDefinitions = $state<Record<string, string>>({});
	let committedActions = $state<
		Record<string, { contact: number; filling: string; immediate: string }>
	>({});
	let goalsVision = $state<
		Record<string, { longTerm: string; intermediate: string; actions: string }>
	>({});

	// Interaction state
	let selectedCardId = $state<string | null>(null);

	const STORAGE_KEY = 'personal-values-lab-state';

	// Persistence: Load
	$effect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const data = JSON.parse(saved);
				if (data.tiers) {
					// Map values back to ensure they match current definition if needed
					tiers.forEach((t, i) => {
						if (data.tiers[i]) t.values = data.tiers[i].values;
					});
				}
				if (data.pool) pool = data.pool;
				if (data.currentPhase) currentPhase = data.currentPhase;
				if (data.top5) top5 = data.top5;
				if (data.personalDefinitions) personalDefinitions = data.personalDefinitions;
				if (data.committedActions) committedActions = data.committedActions;
				if (data.goalsVision) goalsVision = data.goalsVision;
			} catch (e) {
				console.error('Failed to load state:', e);
			}
		}
	});

	// Persistence: Save
	$effect(() => {
		const state = {
			tiers: tiers.map((t) => ({ label: t.label, values: t.values })),
			pool,
			currentPhase,
			top5,
			personalDefinitions,
			committedActions,
			goalsVision
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	});

	function handleDragStart(e: DragEvent, id: string) {
		selectedCardId = null; // Clear click selection on drag
		e.dataTransfer?.setData('text/plain', id);
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function selectValue(id: string) {
		if (selectedCardId === id) {
			selectedCardId = null;
		} else {
			selectedCardId = id;
		}
	}

	function handleDrop(e: DragEvent, targetTierLabel: string | null) {
		const id = e.dataTransfer?.getData('text/plain');
		if (!id) return;
		moveValue(id, targetTierLabel);
	}

	function moveValue(id: string, targetTierLabel: string | null) {
		if (currentPhase !== 1) return;

		let value = findAndRemoveValue(id);
		if (!value) return;

		if (targetTierLabel === null) {
			pool.push(value);
		} else {
			const targetTier = tiers.find((t) => t.label === targetTierLabel);
			if (targetTier) {
				targetTier.values.push(value);
			}
		}
		selectedCardId = null;
	}

	function findAndRemoveValue(id: string): Value | undefined {
		// Check tiers
		for (let i = 0; i < tiers.length; i++) {
			const foundIndex = tiers[i].values.findIndex((v) => v.id === id);
			if (foundIndex !== -1) {
				const v = tiers[i].values[foundIndex];
				tiers[i].values.splice(foundIndex, 1);
				return v;
			}
		}

		// Check pool
		const foundIndex = pool.findIndex((v) => v.id === id);
		if (foundIndex !== -1) {
			const v = pool[foundIndex];
			pool.splice(foundIndex, 1);
			return v;
		}

		return undefined;
	}

	function handlePoolDrop(e: DragEvent) {
		e.preventDefault();
		handleDrop(e, null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function toggleHelp() {
		showHelp = !showHelp;
	}

	function goToPhase(p: number) {
		currentPhase = p;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleTop5Drop(e: DragEvent, index: number) {
		e.preventDefault();
		const id = e.dataTransfer?.getData('text/plain');
		if (!id) return;
		moveValueToTop5(id, index);
	}

	function moveValueToTop5(id: string, index: number) {
		// Logic for Phase 2:
		// We can "pick" a value from the categorized list (tiers)
		// and place it in a Top 5 slot.

		// Find the value in tiers
		let value: Value | undefined;
		for (const tier of tiers) {
			value = tier.values.find((v) => v.id === id);
			if (value) break;
		}

		// Also check if it's already in another top5 slot (swap/move)
		const existingIndex = top5.findIndex((v) => v?.id === id);

		if (!value && existingIndex === -1) return;

		const valueToPlace = value || top5[existingIndex]!;

		// If moving within top5
		if (existingIndex !== -1) {
			top5[existingIndex] = null;
		}

		// Place in new slot (and handle eviction if necessary)
		top5[index] = valueToPlace;

		// Ensure definition exists
		if (valueToPlace && !personalDefinitions[valueToPlace.id]) {
			personalDefinitions[valueToPlace.id] = '';
		}
		selectedCardId = null;
	}

	function removeFromTop5(index: number) {
		top5[index] = null;
	}

	const validTop5 = $derived(top5.filter((v): v is Value => v !== null));

	const categorizedCandidates = $derived(
		tiers
			.filter((t) => t.label === 'S' || t.label === 'A')
			.flatMap((t) => t.values.map((v) => ({ ...v, tierLabel: t.label, tierColor: t.color })))
	);

	const canProceedToPhase2 = $derived(
		tiers
			.filter((t) => t.label === 'S' || t.label === 'A')
			.reduce((acc, t) => acc + t.values.length, 0) >= 5
	);

	const canFinishRanking = $derived(top5.every((v) => v !== null));

	// Pre-initialize actions and goals for the selected top 5
	$effect(() => {
		for (const v of validTop5) {
			if (!committedActions[v.id]) {
				committedActions[v.id] = { contact: 5, filling: '', immediate: '' };
			}
			if (!goalsVision[v.id]) {
				goalsVision[v.id] = { longTerm: '', intermediate: '', actions: '' };
			}
		}
	});
</script>

<svelte:head>
	<title>Ценности — Тир-лист</title>
</svelte:head>

<header>
	<div class="header-main">
		<h1>Мои <span class="accent">Ценности</span></h1>
		<button
			class="help-btn glass"
			onclick={toggleHelp}
			title="Справка"
			aria-label="Показать справку"
		>
			?
		</button>
	</div>

	{#if showHelp}
		<div class="intro glass" transition:fade={{ duration: 200 }}>
			<p>
				<b
					>Ценности говорят нам о том, как мы хотим себя вести в каждый момент времени, в течение
					всей жизни.</b
				>
			</p>
			<p>
				Поэтому в каком-то смысле они описывают, каким человеком мы бы хотели быть и какой жизнью мы
				хотели бы жить. Например, если вам важна ценность «заботы», то, что именно в ваших поступках
				может ее отражать? Как вы можете вести себя по отношению к себе, другим и окружающему миру,
				чтобы в этом поведении выражалась ваша забота и этой ценности становилось больше, улучшался
				контакт с нею?
			</p>
			<p>
				Ценностей можно придумать бесконечно много. Не бывает «правильных» и «неправильных»
				ценностей. Это как с нашими предпочтениями, скажем, по поводу пиццы. Вы можете любить пиццу
				с уткой и горгондзолой, кто-то другой - четыре сыра или маргариту, но это не значит, что
				чей-то вкус правильный, а ваш нет. Это лишь говорит о том, что ваши вкусы различаются. То же
				касается и ценностей: они могут быть разными и это нормально. Важно выбрать именно ваши.
			</p>
			{#if currentPhase === 1}
				<p>
					<i
						>Выберите 5-8 наиболее значимых ценностей именно для вас. Распределите их по категориям
						сложности/приоритетности.</i
					>
				</p>
			{:else if currentPhase === 2}
				<p>
					<i
						>Выберите пять самых важных для вас на данный момент ценностей и распределите их по
						местам, начиная с самой значимой.</i
					>
				</p>
			{:else if currentPhase === 3}
				<p>
					<i>Оцените текущий контакт с вашими главными ценностями и наметьте первые шаги.</i>
				</p>
			{:else if currentPhase === 4}
				<p>
					<i
						>Сформулируйте долгосрочное видение и цели, которые помогут вам следовать вашим
						ценностям.</i
					>
				</p>
			{/if}
		</div>
	{:else}
		<div class="intro-mini">
			{#if currentPhase === 1}
				<p>Распределите наиболее важные для вас ценности по категориям приоритетности.</p>
			{:else if currentPhase === 2}
				<p>Выберите 5 самых важных ценностей из вашего списка.</p>
			{:else if currentPhase === 3}
				<p>Оцените контакт с ценностями и наметьте действия.</p>
			{:else if currentPhase === 4}
				<p>Сформулируйте цели и видение.</p>
			{:else}
				<p>Ваш результат готов.</p>
			{/if}
		</div>
	{/if}
</header>

<main>
	{#if currentPhase === 1}
		<div class="phase1" transition:fade>
			<div class="tier-list">
				{#each tiers as tier (tier.label)}
					<TierRow
						{...tier}
						isSelectedId={selectedCardId}
						onDrop={handleDrop}
						onDragStart={handleDragStart}
						onClickValue={selectValue}
						onClickTier={(label) => moveValue(selectedCardId!, label)}
					/>
				{/each}
			</div>

			<section class="pool-section">
				<div class="section-header">
					<h2 class="section-title">Список ценностей</h2>
					{#if canProceedToPhase2}
						<button class="btn btn-primary" onclick={() => goToPhase(2)}> Продолжить → </button>
					{/if}
				</div>

				<div
					class="pool-container glass"
					class:clickable={!!selectedCardId && !pool.find((v) => v.id === selectedCardId)}
					ondrop={handlePoolDrop}
					ondragover={handleDragOver}
					onclick={() => selectedCardId && moveValue(selectedCardId, null)}
					role="listbox"
					aria-label="Пул ценностей"
					tabindex="0"
				>
					{#each pool as value (value.id)}
						<ValueCard
							{...value}
							onDragStart={handleDragStart}
							isSelected={selectedCardId === value.id}
							onClick={selectValue}
						/>
					{/each}
					{#if pool.length === 0}
						<p class="empty-msg">Все ценности распределены</p>
					{/if}
				</div>
			</section>
		</div>
	{:else if currentPhase === 2}
		<Top5Selection
			bind:top5
			bind:personalDefinitions
			categorizedValues={categorizedCandidates}
			{selectedCardId}
			onDrop={handleTop5Drop}
			{moveValueToTop5}
			onRemove={removeFromTop5}
			onFinish={() => goToPhase(3)}
			onBack={() => goToPhase(1)}
			canFinish={canFinishRanking}
			{handleDragStart}
			{handleDragOver}
			onClickValue={selectValue}
		/>
	{:else if currentPhase === 3}
		<CommittedActions
			values={validTop5}
			bind:committedActions
			onBack={() => goToPhase(2)}
			onNext={() => goToPhase(4)}
		/>
	{:else if currentPhase === 4}
		<GoalsVision
			values={validTop5}
			bind:goalsVision
			onBack={() => goToPhase(3)}
			onFinish={() => goToPhase(5)}
		/>
	{:else if currentPhase === 5}
		<ResultsSummary
			{top5}
			{personalDefinitions}
			{committedActions}
			{goalsVision}
			{tiers}
			onBack={() => goToPhase(4)}
		/>
	{/if}
</main>

<footer>
	<p>© 2026 Тест ценностей. Ваши данные хранятся у Вас локально и никуда не передаются.</p>
</footer>

<style>
	header {
		text-align: center;
		margin-bottom: 3rem;
		max-width: 900px;
		margin-left: auto;
		margin-right: auto;
	}

	.header-main {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 3.5rem;
		margin: 0;
		background: linear-gradient(to right, #fff, #94a3b8);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.help-btn {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.25rem;
		cursor: pointer;
		color: var(--accent-primary);
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
	}

	.help-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.05);
		border-color: var(--accent-primary);
		box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
	}

	.intro-mini {
		opacity: 0.7;
		font-size: 1.1rem;
	}

	.intro {
		text-align: left;
		padding: 2rem;
		font-size: 1rem;
		line-height: 1.6;
		margin-top: 1rem;
	}

	.intro p {
		margin-bottom: 1rem;
	}

	.intro p:last-child {
		margin-bottom: 0;
	}

	.accent {
		background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.tier-list {
		margin-bottom: 4rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1.5rem;
		margin: 0;
		color: var(--text-primary);
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-light);
		color: var(--text-secondary);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	.pool-container {
		min-height: 200px;
		padding: 2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-start;
		justify-content: flex-start;
		border-style: dashed;
	}

	.pool-container.clickable {
		cursor: pointer;
		border-color: var(--accent-primary);
	}

	.pool-container.clickable:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.empty-msg {
		width: 100%;
		text-align: center;
		opacity: 0.5;
		font-style: italic;
	}

	footer {
		margin-top: auto;
		padding: 2rem 0;
		text-align: center;
		border-top: 1px solid var(--border-light);
		opacity: 0.6;
		font-size: 0.9rem;
	}

	@media print {
		header,
		footer,
		.section-header {
			display: none !important;
		}
	}
</style>
