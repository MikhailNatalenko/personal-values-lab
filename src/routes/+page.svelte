<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import TierRow from '$lib/components/TierRow.svelte';
	import ValueCard from '$lib/components/ValueCard.svelte';
	import Top5Selection from '$lib/components/Top5Selection.svelte';
	import CommittedActions from '$lib/components/CommittedActions.svelte';
	import GoalsVision from '$lib/components/GoalsVision.svelte';
	import ResultsSummary from '$lib/components/ResultsSummary.svelte';
	import ProgressStepper from '$lib/components/ProgressStepper.svelte';
	import { tooltip } from '$lib/tooltipStore';
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

	// Custom value creation state
	let customValueName = $state('');
	let customValueDesc = $state('');

	function addCustomValue() {
		if (!customValueName.trim()) return;

		const newValue: Value = {
			id: `custom-${Date.now()}`,
			name: customValueName.trim(),
			description: customValueDesc.trim() || 'Ваша собственная ценность'
		};

		pool = [newValue, ...pool];
		customValueName = '';
		customValueDesc = '';
	}

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
		const existingIndex = top5.findIndex((v) => v?.id === id);
		const targetOccupant = top5[index];

		// Case 1: Value is already in Top 5 (Reordering)
		if (existingIndex !== -1) {
			const sourceValue = top5[existingIndex]!;

			// Remove from old position
			const newTop5 = [...top5];
			newTop5.splice(existingIndex, 1, null);

			// If target is empty, just place it
			if (!targetOccupant) {
				newTop5[index] = sourceValue;
			} else {
				// Shuffling logic: Insert at new position and shift others
				const valuesOnly = top5.filter((v): v is Value => v !== null);
				const movingValue = sourceValue;
				const otherValues = valuesOnly.filter((v) => v.id !== id);

				// Insert at the requested index among active values
				otherValues.splice(index, 0, movingValue);

				// Reconstruct top5 with padding
				for (let i = 0; i < 5; i++) {
					newTop5[i] = otherValues[i] || null;
				}
			}
			top5 = newTop5;
			selectedCardId = null;
			return;
		}

		// Case 2: Value is coming from tiers
		let value: Value | undefined;
		for (const tier of tiers) {
			const foundIdx = tier.values.findIndex((v) => v.id === id);
			if (foundIdx !== -1) {
				value = tier.values[foundIdx];
				tier.values.splice(foundIdx, 1);
				break;
			}
		}

		if (!value) return;

		// Shift existing values if target is occupied or we want to insert
		const valuesOnly = top5.filter((v): v is Value => v !== null);
		valuesOnly.splice(index, 0, value);

		// If we now have > 5 values, return the last one to tiers
		if (valuesOnly.length > 5) {
			const evicted = valuesOnly.pop()!;
			const targetTier = tiers.find((t) => t.label === 'S') || tiers[0];
			targetTier.values.push(evicted);
		}

		// Update top5 state
		const newTop5 = Array(5).fill(null);
		valuesOnly.forEach((v, i) => {
			newTop5[i] = v;
			if (!personalDefinitions[v.id]) {
				personalDefinitions[v.id] = '';
			}
		});
		top5 = newTop5;
		selectedCardId = null;
	}

	function removeFromTop5(index: number) {
		top5[index] = null;
	}

	function handleReset() {
		if (
			window.confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')
		) {
			// Clear localStorage
			localStorage.removeItem(STORAGE_KEY);

			// Reset state to initials
			pool = [...initialValues];
			tiers.forEach((t) => (t.values = []));
			top5 = Array(5).fill(null);
			personalDefinitions = {};
			goalsVision = {};
			committedActions = {};
			currentPhase = 1;
			selectedCardId = null;

			// Force reload to ensure all state is clean
			window.location.reload();
		}
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
		<button
			class="reset-btn glass"
			onclick={handleReset}
			title="Сбросить прогресс"
			aria-label="Сбросить прогресс"
		>
			↺
		</button>
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

	<ProgressStepper {currentPhase} />

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
			<div class="main-layout">
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

				<aside class="pool-section glass">
					<div class="section-header">
						<div class="header-top">
							<h2 class="section-title">Ценности</h2>
							{#if canProceedToPhase2}
								<button class="btn btn-primary next-phase-btn" onclick={() => goToPhase(2)}>
									Продолжить →
								</button>
							{/if}
						</div>

						<div class="add-custom-form">
							<div class="input-group">
								<input
									type="text"
									placeholder="Своя ценность..."
									bind:value={customValueName}
									class="glass"
								/>
								<button class="btn btn-secondary add-btn" onclick={addCustomValue} title="Добавить">
									+
								</button>
							</div>
							{#if customValueName}
								<textarea
									placeholder="Краткое описание (необязательно)"
									bind:value={customValueDesc}
									class="glass"
									transition:slide
								></textarea>
							{/if}
						</div>
					</div>

					<div
						class="pool-container"
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
							<p class="empty-msg">Всё распределено</p>
						{/if}
					</div>
				</aside>
			</div>
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

{#if $tooltip.active}
	<div
		class="global-tooltip glass"
		style="left: {$tooltip.x}px; top: {$tooltip.y}px;"
		transition:fade={{ duration: 100 }}
	>
		<strong>{$tooltip.name}</strong>
		<p>{$tooltip.description}</p>
	</div>
{/if}

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
		margin-bottom: 1.5rem;
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

	.reset-btn {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.5rem;
		cursor: pointer;
		color: #ff4757;
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 107, 129, 0.1);
		background: rgba(255, 107, 129, 0.05);
	}

	.reset-btn:hover {
		background: rgba(255, 107, 129, 0.15);
		transform: scale(1.05) rotate(-30deg);
		border-color: #ff4757;
		box-shadow: 0 0 15px rgba(255, 71, 87, 0.3);
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

	.main-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2rem;
		align-items: start;
		max-width: 1400px;
		margin: 0 auto;
	}

	.tier-list {
		flex-grow: 1;
	}

	.pool-section {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 200px);
		position: sticky;
		top: 2rem;
		padding: 0;
		border-style: solid;
	}

	.pool-section .section-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-light);
		background: rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 1; /* Lowered from 5 to avoid overlap with tooltips */
		position: relative;
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.add-custom-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.add-custom-form .input-group {
		display: flex;
		gap: 0.5rem;
	}

	.add-custom-form input,
	.add-custom-form textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		outline: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		background: rgba(255, 255, 255, 0.05);
	}

	.add-custom-form input::placeholder,
	.add-custom-form textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.add-custom-form textarea {
		min-height: 60px;
		resize: none;
	}

	.add-custom-form .add-btn {
		padding: 0 0.75rem;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.next-phase-btn {
		white-space: nowrap;
		padding: 0.5rem 1rem !important;
		font-size: 0.9rem !important;
		box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
	}

	.pool-container {
		flex-grow: 1;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--accent-primary) transparent;
	}

	.pool-container::-webkit-scrollbar {
		width: 4px;
	}

	.pool-container::-webkit-scrollbar-thumb {
		background: var(--accent-primary);
		border-radius: 4px;
	}

	.pool-container.clickable {
		cursor: pointer;
		background: rgba(255, 255, 255, 0.03);
	}

	.empty-msg {
		text-align: center;
		padding: 2rem;
		opacity: 0.5;
		font-style: italic;
	}

	@media (max-width: 1100px) {
		.main-layout {
			grid-template-columns: 1fr;
		}
		.pool-section {
			position: static;
			height: auto;
			max-height: 400px;
		}
		.pool-container {
			flex-direction: row;
			flex-wrap: wrap;
		}
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
		.section-header,
		.global-tooltip {
			display: none !important;
		}
	}

	.global-tooltip {
		position: fixed;
		bottom: auto; /* Overriding possible defaults */
		left: 0;
		top: 0;
		transform: translate(-50%, -110%);
		padding: 1rem 1.25rem;
		width: 320px;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--text-primary);
		background: rgba(15, 23, 42, 0.98);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		pointer-events: none;
		z-index: 10000; /* Above everything */
		text-align: left;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.6),
			0 0 20px rgba(0, 210, 255, 0.1);
	}

	.global-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 6px;
		border-style: solid;
		border-color: rgba(15, 23, 42, 0.98) transparent transparent transparent;
	}
</style>
