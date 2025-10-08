export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, delay: number) {
  let handle: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (handle) {
      clearTimeout(handle);
    }
    handle = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
