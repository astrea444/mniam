import { ref, reactive, computed, watch, onUnmounted } from "vue";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const scheduleRaf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (cb) => setTimeout(cb, 0);
const cancelRaf = typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : clearTimeout;

function animateValue({ from, to, duration, onUpdate, rafRef }) {
  if (rafRef.value) cancelRaf(rafRef.value);

  if (prefersReducedMotion()) {
    onUpdate(to);
    return;
  }

  const start = performance.now();
  const diff = to - from;

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    onUpdate(from + diff * easeOutCubic(progress));

    rafRef.value = progress < 1 ? scheduleRaf(step) : null;
  };

  rafRef.value = scheduleRaf(step);
}

const parseValue = (value) => {
  const str = String(value);
  const match = str.match(/-?\d+(\.\d+)?/);
  if (!match) return { number: 0, prefix: "", suffix: str };
  return {
    number: parseFloat(match[0]),
    prefix: str.slice(0, match.index),
    suffix: str.slice(match.index + match[0].length),
  };
};

export function useCountUp(source, duration = 800) {
  const display = ref(0);
  const raf = ref(null);

  watch(
    source,
    (newVal, oldVal) => {
      animateValue({
        from: oldVal ?? 0,
        to: newVal ?? 0,
        duration,
        onUpdate: (v) => (display.value = Math.round(v)),
        rafRef: raf,
      });
    },
    { immediate: true },
  );

  onUnmounted(() => raf.value && cancelRaf(raf.value));

  return display;
}

export function useAnimatedMacros(source, duration = 800) {
  const current = reactive({});
  const rafMap = {};

  watch(
    source,
    (list) => {
      list.forEach((entry) => {
        const { number } = parseValue(entry.value);
        rafMap[entry.label] ??= { value: null };

        animateValue({
          from: current[entry.label] ?? 0,
          to: number,
          duration,
          onUpdate: (v) => (current[entry.label] = v),
          rafRef: rafMap[entry.label],
        });
      });
    },
    { immediate: true, deep: true },
  );

  onUnmounted(() => {
    Object.values(rafMap).forEach(
      (r) => r.value && cancelRaf(r.value),
    );
  });

  return computed(() =>
    source.value.map((entry) => {
      const { prefix, suffix } = parseValue(entry.value);
      const value = Math.round(current[entry.label] ?? 0);
      return { ...entry, displayValue: `${prefix}${value}${suffix}` };
    }),
  );
}
