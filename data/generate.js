const { writeFileSync } = require("fs");
const { generate } = require("randomstring");
const { v4 } = require("uuid");

const getAttributeName = (index) => "Attr" + `00${index}`.slice(-3);

const generateMockItem = (itemSize) => ({
  UserId: v4(),
  ...Array.from({ length: itemSize }).reduce((acc, _, index) => {
    const key = getAttributeName(index);
    acc[key] = generate(1000);
    return acc;
  }, {}),
});

const generateTestData = (itemCount, itemSize) => {
  const mockData = Array.from({ length: itemCount }).map(() =>
    generateMockItem(itemSize)
  );
  writeFileSync(`./data/mockData_${itemCount}_${itemSize}.json`, JSON.stringify(mockData));
};

generateTestData(100, 400);