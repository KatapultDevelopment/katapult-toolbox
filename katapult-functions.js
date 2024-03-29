// Takes an array and calls a function to process each item in the array
// in batches of a given size. This can be helpful for when you need to process
// large amounts of data and must call asynchronous functions while processing
// @param {Array} list - full array of items to process
// @param {Number} batchSize - the max size of each batch of items
// @param {Function} processFunction - function to be called to process each item in the batch (must have parameter for item and for callback)
// @param {Function} callback - function that will be called when all items in the list array have been processed
export function ProcessListInBatch(list, batchSize, processFunction, callback) {

    // Call callback if the list is null or empty
    if (!list || list.length == 0) callback();

    console.log(list.length + " items left");

    // Process in batches of size batchSize
    var batch = list.splice(0, batchSize);
    var remaining = batch.length;

    // Call the process function for each item in the batch
    batch.forEach(function(item) {
        processFunction(item, function() {
            // Call the next batch when this is done
            if (--remaining == 0) ProcessListInBatch(list, batchSize, processFunction, callback);
        });
    });
}