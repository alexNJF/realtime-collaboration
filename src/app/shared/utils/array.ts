export function mergeWithPriority(array1:any[], array2:any[], key:string) {
    // Create a map to track unique objects based on the key
    

    const map = new Map();

    // First, add all objects from array1 (prioritized)
    array1.forEach(item => map.set(item[key], item));

    // Then, add objects from array2 only if they don't exist in array1
    array2.forEach(item => {
        if (!map.has(item[key])) {
            map.set(item[key], item);
        }
    });

    // Convert the map values back into an array
    return Array.from(map.values());
}