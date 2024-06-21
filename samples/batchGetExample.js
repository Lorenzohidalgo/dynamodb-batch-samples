const {
  BatchGetItemCommand,
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const { mergeWith, isArray } = require("lodash");

const mockData = require("../data/mockData_100_400.json");

const client = new DynamoDBClient({ region: "eu-central-1" });

const tableName = "dynamodb-batch-samples-dev-table";

const customizer = (objValue, srcValue) =>
  isArray(objValue) ? objValue.concat(srcValue) : objValue;

const mergeObjects = (target, source) => mergeWith(target, source, customizer);

const buildRequestObject = (keys) => ({
  RequestItems: {
    [tableName]: {
      Keys: keys.map((keyElements) => marshall(keyElements)),
    },
  },
});

const executeRequest = async (payload) => {
  try {
    const { Responses, UnprocessedKeys } = await client.send(payload);

    const results = Object.keys(Responses ?? {}).reduce(
      (accumulator, currentTableName) => {
        accumulator[currentTableName] = Responses[currentTableName].map(
          (item) => unmarshall(item)
        );
        return accumulator;
      },
      {}
    );

    if (Object.keys(UnprocessedKeys ?? {}).length === 0) return results;

    const additionalRecords = await executeRequest(
      new BatchGetItemCommand({ RequestItems: UnprocessedKeys })
    );

    return mergeObjects(results, additionalRecords);
  } catch (error) {
    console.log(error);
  }
};

const batchGetItems = async (keys) => {
  const command = new BatchGetItemCommand(buildRequestObject(keys));
  const responses = await executeRequest(command);
  return responses;
};

(async () => {
  const keys = mockData.slice(0, 25).map(({ UserId }) => ({ UserId }));
  const allItems = await batchGetItems(keys);
  console.log(allItems);
})();
