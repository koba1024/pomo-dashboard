export const playSound = () => {
	const ctx = new AudioContext();
	const oscillator = ctx.createOscillator();
	oscillator.connect(ctx.destination);
	oscillator.frequency.value = 880;
	oscillator.start();
	oscillator.stop(ctx.currentTime + 1);
};
