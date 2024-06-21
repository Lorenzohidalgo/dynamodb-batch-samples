const {
  BatchWriteItemCommand,
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const { splitListIntoChunks } = require("./helpers/utils");

const mockData = require("../data/mockData_100_400.json");

const client = new DynamoDBClient({ region: "eu-central-1" });

const tableName = "dynamodb-batch-samples-dev-table";

const buildRequestObject = (items) => ({
  RequestItems: {
    [tableName]: items.map((item) => ({
      DeleteRequest: {
        Key: marshall(item),
      },
    })),
  },
});

const executeRequest = async (payload) => {
  try {
    const { UnprocessedItems } = await client.send(payload);
    if (Object.keys(UnprocessedItems ?? {}).length > 0)
      await executeRequest(
        new BatchWriteItemCommand({ RequestItems: UnprocessedItems })
      );
  } catch (error) {
    console.log(error);
  }
};

const batchDeleteItems = async (items) => {
  const command = new BatchWriteItemCommand(buildRequestObject(items));
  await executeRequest(command);
};

(async () => {
  const keys = mockData.slice(0, 25).map(({ UserId }) => ({ UserId }));
  const executionItems = splitListIntoChunks(keys, 25);
  await Promise.all(executionItems.map((items) => batchDeleteItems(items)));
})();
