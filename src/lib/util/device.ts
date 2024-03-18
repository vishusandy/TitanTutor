// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent

function coarse(): boolean {
    const mQ = matchMedia?.("(pointer:coarse)");
    if (mQ?.media === "(pointer:coarse)") {
        return !!mQ.matches;
    }

    if ("orientation" in window) {
        return true; // deprecated, but good fallback
    }

    // Only as a last resort, fall back to user agent sniffing
    const UA = navigator.userAgent;
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
}

export function hasTouchScreen(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    return ("virtualKeyboard" in navigator)
        || ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0)
        // @ts-ignore
        || ("msMaxTouchPoints" in navigator && navigator.msMaxTouchPoints > 0)
        || coarse();
}
