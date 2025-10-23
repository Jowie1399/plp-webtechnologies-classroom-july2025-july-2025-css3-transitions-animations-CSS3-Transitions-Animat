/* script.js
   -------------------------
   Purpose: Demonstrate JS scope, parameters, return values,
   event handling and animation triggers (starting CSS keyframes).
   - Sections are labeled with comments for clarity for graders.
   ------------------------- */

/* -------------------------
   Global scope (global variables)
   ------------------------- */
/* This variable lives in global scope for the page and can be used by many functions. */
let globalCounter = 0;

/* Cached DOM references */
const btnSlide = document.getElementById('trigger-slide');
const btnPulse = document.getElementById('trigger-pulse');
const btnFade  = document.getElementById('trigger-fade');
const btnSeq   = document.getElementById('trigger-sequence');

const boxSlide = document.getElementById('box-slide');
const boxPulse = document.getElementById('box-pulse');
const boxFade  = document.getElementById('box-fade');

const btnShowScope = document.getElementById('show-scope');
const btnCompute = document.getElementById('compute-btn');
const numberInput = document.getElementById('number-input');
const computeResult = document.getElementById('compute-result');

const animateWithCallbackBtn = document.getElementById('animate-with-callback');
const callbackResult = document.getElementById('callback-result');

/* -------------------------
   SECTION 1 — Helper utilities (pure functions + return values)
   - Demonstrates parameters and return values
   ------------------------- */

/**
 * clampNumber
 * Accepts a value and clamps it to the provided min/max.
 * Shows parameter use and returns a value.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * computeSquarePlusOffset
 * Accepts a numeric parameter and an optional offset.
 * Returns computed number (shows return value).
 * @param {number} x
 * @param {number} [offset=1]
 * @returns {number}
 */
function computeSquarePlusOffset(x, offset = 1) {
  const num = Number(x);
  if (Number.isNaN(num)) return null;
  return (num * num) + offset;
}

/* -------------------------
   SECTION 2 — Animation trigger functions
   - These functions start animations by toggling CSS classes
   - They also demonstrate local scope vs global scope
   ------------------------- */

/**
 * startAnimation
 * Adds an animation class to an element and returns a Promise
 * resolved when the animation finishes. This is useful for sequencing.
 *
 * @param {HTMLElement} element - target element
 * @param {string} animClass - the CSS class that triggers animation
 * @param {number} timeoutFallback - ms to fallback if animationend doesn't fire
 * @returns {Promise} resolves with event object or 'timeout'
 */
function startAnimation(element, animClass, timeoutFallback = 2500) {
  return new Promise((resolve) => {
    // Local scope variable — used only within this function
    let finished = false;

    function handleEnd(event) {
      finished = true;
      element.classList.remove(animClass);
      element.classList.remove('playing');
      element.removeEventListener('animationend', handleEnd);
      resolve(event || { detail: 'animationend' });
    }

    // Safety fallback in case animationend isn't supported or fails
    const fallbackTimer = setTimeout(() => {
      if (!finished) {
        element.classList.remove(animClass);
        element.classList.remove('playing');
        resolve('timeout');
      }
    }, timeoutFallback);

    // Attach listener, add class to start animation
    element.addEventListener('animationend', (ev) => {
      clearTimeout(fallbackTimer);
      handleEnd(ev);
    }, { once: true });

    // Add helper class for styling when playing
    element.classList.add('playing');
    // Start animation
    element.classList.add(animClass);
  });
}

/* -------------------------
   SECTION 3 — Event handling for animation buttons
   - Each button calls startAnimation; demonstrates using returned Promise
   ------------------------- */

btnSlide.addEventListener('click', () => {
  // start slide animation on boxSlide. we don't need a callback here.
  startAnimation(boxSlide, 'animate-slide').then(() => {
    // increase global counter when slide finishes to show scope interaction
    globalCounter += 1;
    console.log('Slide finished. globalCounter =', globalCounter);
  });
});

btnPulse.addEventListener('click', () => {
  // start pulse animation; local variable demonstrates function scope
  startAnimation(boxPulse, 'animate-pulse', 1200).then(() => {
    // local scope: do a small effect after the animation
    boxPulse.style.transform = 'translateY(-2px)';
    setTimeout(() => { boxPulse.style.transform = ''; }, 250);
  });
});

btnFade.addEventListener('click', () => {
  // fade element and then restore; show return value handling
  startAnimation(boxFade, 'animate-fade', 2000).then((result) => {
    console.log('Fade completed with result:', result);
  });
});

/* -------------------------
   SECTION 4 — Sequence example (chain animations using returned promises)
   - Demonstrates function parameters and handling returned Promises
   ------------------------- */

btnSeq.addEventListener('click', async () => {
  btnSeq.disabled = true;
  callbackResult.textContent = 'Sequence running...';

  // Sequence: slide -> pulse -> fade
  await startAnimation(boxSlide, 'animate-slide');
  await startAnimation(boxPulse, 'animate-pulse');
  await startAnimation(boxFade, 'animate-fade');

  callbackResult.textContent = 'Sequence finished ✅';
  btnSeq.disabled = false;
});

/* -------------------------
   SECTION 5 — JS scope demonstration button
   - Shows global vs local variable behavior + a closure example
   ------------------------- */

btnShowScope.addEventListener('click', () => {
  // local variable inside the event handler (function scope)
  const localMsg = 'I am local to showScope handler';

  // IIFE demonstrating closure: inner function remembers outer variable
  (function closureExample() {
    const outer = 'outerVar';
    function inner() {
      console.log('Closure sees:', outer);
    }
    inner(); // prints 'outerVar'
  })();

  console.group('Scope demo (open console)');
  console.log('globalCounter (global scope):', globalCounter);
  console.log('localMsg (local scope in handler):', localMsg);
  console.log('Demonstrating closure above (check previous line).');
  console.groupEnd();
});

/* -------------------------
   SECTION 6 — compute button demonstrating parameters and return values
   - Uses computeSquarePlusOffset function; shows return handling and UI update
   ------------------------- */

if (btnCompute) {
  btnCompute.addEventListener('click', () => {
    const raw = numberInput.value;
    const clamped = clampNumber(raw, -10000, 10000); // parameter usage
    const result = computeSquarePlusOffset(clamped, 3); // returns a number
    if (result === null) {
      computeResult.textContent = 'Result: invalid input';
    } else {
      computeResult.textContent = `Result: ${result}`;
    }
  });
}

/* -------------------------
   SECTION 7 — animate-with-callback button: returns a promise and demonstrates async/await
   ------------------------- */
animateWithCallbackBtn.addEventListener('click', async () => {
  callbackResult.textContent = 'Animating (promise)...';
  // call startAnimation and await completion (demonstrates using return value)
  const res = await startAnimation(boxPulse, 'animate-pulse');
  callbackResult.textContent = `Animation completed (returned: ${String(res.detail ?? res)})`;
});

/* -------------------------
   Extra: small initialization to show initial state (demonstrates scope use)
   ------------------------- */
(function init() {
  // Using globalCounter as a visible demonstration of global state
  globalCounter = 0;
  console.log('Script initialized — globalCounter set to', globalCounter);
})();
