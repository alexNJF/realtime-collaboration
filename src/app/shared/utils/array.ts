export function mergeWithPriority(array1: any[], array2: any[], key: string) {
    const map = new Map();

    // First, add all objects from array1 (prioritized)
    array1.forEach(item => map.set(item[key], item));

    // Then, add objects from array2 only if they don't exist in array1
    // array2.forEach((item: { action: string, data: { shapeId: string, changes: any } }) => {
    //     if (map.has(item.data.shapeId)) {
    //         const newItem = {
    //             ...map.get(item.data.shapeId),
    //             ...item.data.changes
    //         }
    //         map.set(item.data.shapeId, newItem);
    //     }
    // });



    // Convert the map values back into an array
    return Array.from(map.values());
}