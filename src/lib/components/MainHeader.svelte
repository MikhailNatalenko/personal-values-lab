<script lang="ts">
	import { fade } from 'svelte/transition';
	import { appState } from '$lib/state.svelte';
	import ProgressStepper from './ProgressStepper.svelte';
</script>

<header>
	<div class="header-main">
		<button
			class="reset-btn glass"
			onclick={appState.handleReset}
			title="Сбросить прогресс"
			aria-label="Сбросить прогресс"
		>
			↺
		</button>
		<h1>Мои <span class="accent">Ценности</span></h1>
		<button
			class="help-btn glass"
			onclick={appState.toggleHelp}
			title="Справка"
			aria-label="Показать справку"
		>
			?
		</button>
	</div>

	<ProgressStepper currentPhase={appState.currentPhase} />

	{#if appState.showHelp}
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
			{#if appState.currentPhase === 1}
				<p>
					<i
						>Выберите 5-8 наиболее значимых ценностей именно для вас. Распределите их по категориям
						сложности/приоритетности.</i
					>
				</p>
			{:else if appState.currentPhase === 2}
				<p>
					<i
						>Выберите пять самых важных для вас на данный момент ценностей и распределите их по
						местам, начиная с самой значимой.</i
					>
				</p>
			{:else if appState.currentPhase === 3}
				<p>
					<i>Оцените текущий контакт с вашими главными ценностями и наметьте первые шаги.</i>
				</p>
			{:else if appState.currentPhase === 4}
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
			{#if appState.currentPhase === 1}
				<p>Распределите наиболее важные для вас ценности по категориям приоритетности.</p>
			{:else if appState.currentPhase === 2}
				<p>Выберите 5 самых важных ценностей из вашего списка.</p>
			{:else if appState.currentPhase === 3}
				<p>Оцените контакт с ценностями и наметьте действия.</p>
			{:else if appState.currentPhase === 4}
				<p>Сформулируйте цели и видение.</p>
			{:else}
				<p>Ваш результат готов.</p>
			{/if}
		</div>
	{/if}
</header>

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

	@media print {
		header {
			display: none !important;
		}
	}
</style>
