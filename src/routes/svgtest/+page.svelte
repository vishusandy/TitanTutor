	<svg class="loading" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
		<circle class="circle" cx="200" cy="200" r="100" />
		<circle class="circle-bg" cx="200" cy="200" r="103" />
	</svg>

<style>
	.loading {
		height: 50px;
		width: 50px;
		/* animation: spin 10s linear infinite; */
	}
	.circle-bg {
		fill: none;
		/* fill: #5e5e5ea0; */
		/* stroke: #5e5e5ea0; */
	}
	circle {
		fill: none;
		stroke-width: 30;
		stroke: #aeaeae;
		stroke-linecap: round;
		animation: loading-cirle 3s linear infinite;
	}

	@keyframes loading-cirle {
		0% {
			stroke-dasharray: 0 628;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 628 0;
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dasharray: 0 628;
			stroke-dashoffset: 628;
		}
	}

	@keyframes spin {
		100% {
			transform-origin: center;
			transform: rotate(360deg);
		}
	}
</style>
