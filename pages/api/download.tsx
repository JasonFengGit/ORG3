import { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Generate the file contents
  // Define the CSV data
  const csvData = [
    ['Address', 'Subdomain'],
    ['0xe77aABbF35ffA66C3bF7A060c4afaF1d2F39CA75', 'sample'],
  ];

  // Convert the CSV data to a string
  const csvString = csvData.map(row => row.join(',')).join('\n');

  // Set the response headers
  res.setHeader('Content-Disposition', 'attachment; filename="org3-sample.csv"');
  res.setHeader('Content-Type', 'text/csv');

  // Send the file contents as the response body
  res.status(200).send(csvString);
};

export default handler;