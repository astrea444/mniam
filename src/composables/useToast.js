import { ref } from "vue";

const MAX_VISIBLE = 3;

const toasts = ref([]);
const queue = [];
let nextId = 1;

const startTimer = (toast) => {
  if (toast.duration > 0) {
    toast._timer = setTimeout(() => {
      remove(toast.id);
    }, toast.duration);
  }
};

const remove = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    clearTimeout(toasts.value[index]._timer);
    toasts.value.splice(index, 1);
  } else {
    const qIndex = queue.findIndex((t) => t.id === id);
    if (qIndex !== -1) queue.splice(qIndex, 1);
    return;
  }

  if (queue.length > 0) {
    const next = queue.shift();
    toasts.value.push(next);
    startTimer(next);
  }
};

export function useToast() {
  const add = (options) => {
    const config = typeof options === "string" ? { message: options } : options;
    const id = nextId++;
    const toast = {
      id,
      title: config.title || "",
      message: config.message || config.content || "",
      type: config.type || "info",
      duration: config.duration ?? 5500,
      onUndo: config.onUndo || null,
      action: config.action || null,
      _timer: null,
    };

    if (toasts.value.length < MAX_VISIBLE) {
      toasts.value.push(toast);
      startTimer(toast);
    } else {
      queue.push(toast);
    }

    return id;
  };

  const notify = (type, titleOrOptions, message, duration) => {
    if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
      return add({ ...titleOrOptions, type });
    }
    if (message === undefined || typeof message === "number") {
      return add({ message: titleOrOptions, type, duration: message });
    }
    return add({ title: titleOrOptions, message, type, duration });
  };

  const success = (title, message, duration) =>
    notify("success", title, message, duration);
  const error = (title, message, duration) =>
    notify("error", title, message, duration);
  const warning = (title, message, duration) =>
    notify("warning", title, message, duration);
  const info = (title, message, duration) =>
    notify("info", title, message, duration);

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info,
  };
}
