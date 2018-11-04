function recurse(result, currentKey, currentValue) {
  Object.entries(currentValue).forEach(([key, value]) => {
    const newCompositeKey = (currentKey && key) ? `${currentKey}.${key}` : (key || currentKey);
    if (typeof value === 'string') {
      result[newCompositeKey] = value;
    } else {
      recurse(result, newCompositeKey, value);
    }
  });
}

export default function flatten(data) {
  const results = {};
  recurse(results, '', data);
  return results;
}
