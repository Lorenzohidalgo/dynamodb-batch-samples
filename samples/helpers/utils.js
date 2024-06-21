const splitListIntoChunks = (list, chunkSize) => {
  const chunkedArray = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    chunkedArray.push(list.slice(i, i + chunkSize));
  }
  return chunkedArray;
};

module.exports = { splitListIntoChunks };
