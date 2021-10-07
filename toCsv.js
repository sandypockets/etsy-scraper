const { Parser } = require('json2csv');

export default function toCsv(jsonData) {
  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(jsonData)
  console.log("CSV Output:  ", csv)
}

