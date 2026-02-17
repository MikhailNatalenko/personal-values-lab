<script lang="ts">
	import { fade } from 'svelte/transition';
	import TierRow from '$lib/components/TierRow.svelte';
	import ValueCard from '$lib/components/ValueCard.svelte';
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

	function handleDragStart(e: DragEvent, id: string) {
		e.dataTransfer?.setData('text/plain', id);
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDrop(e: DragEvent, targetTierLabel: string | null) {
		const id = e.dataTransfer?.getData('text/plain');
		if (!id) return;

		// Find value in any tier or pool
		let value: Value | undefined;

		// Check tiers
		for (let i = 0; i < tiers.length; i++) {
			const foundIndex = tiers[i].values.findIndex((v) => v.id === id);
			if (foundIndex !== -1) {
				value = tiers[i].values[foundIndex];
				tiers[i].values.splice(foundIndex, 1);
				break;
			}
		}

		// Check pool if not found in tiers
		if (!value) {
			const foundIndex = pool.findIndex((v) => v.id === id);
			if (foundIndex !== -1) {
				value = pool[foundIndex];
				pool.splice(foundIndex, 1);
			}
		}

		if (!value) return;

		// Add to target
		if (targetTierLabel === null) {
			pool.push(value);
		} else {
			const targetTier = tiers.find((t) => t.label === targetTierLabel);
			if (targetTier) {
				targetTier.values.push(value);
			}
		}
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
			<p>
				<i
					>Выберите 5-8 наиболее значимых ценностей именно для вас. Распределите их по категориям
					сложности/приоритетности.</i
				>
			</p>
		</div>
	{:else}
		<div class="intro-mini">
			<p>Распределите наиболее важные для вас ценности по категориям приоритетности.</p>
		</div>
	{/if}
</header>

<main>
	<div class="tier-list">
		{#each tiers as tier (tier.label)}
			<TierRow {...tier} onDrop={handleDrop} onDragStart={handleDragStart} />
		{/each}
	</div>

	<section class="pool-section">
		<h2 class="section-title">Список ценностей</h2>
		<div
			class="pool-container glass"
			ondrop={handlePoolDrop}
			ondragover={handleDragOver}
			role="listbox"
			aria-label="Пул ценностей"
			tabindex="0"
		>
			{#each pool as value (value.id)}
				<ValueCard {...value} onDragStart={handleDragStart} />
			{/each}
			{#if pool.length === 0}
				<p class="empty-msg">Все ценности распределены</p>
			{/if}
		</div>
	</section>
</main>

<footer>
	<p>© 2026 Тест ценностей.</p>
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

	.section-title {
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
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
</style>
