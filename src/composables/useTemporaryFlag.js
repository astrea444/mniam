import { ref } from 'vue'

export function useTemporaryFlag(duration = 2000) {
    const flag = ref(false)
    let timeoutId = null

    function trigger(onReset) {
        flag.value = true
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            flag.value = false
            timeoutId = null
            if (onReset) onReset()
        }, duration)
    }

    function clear() {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = null
        flag.value = false
    }

    return { flag, trigger, clear }
}
