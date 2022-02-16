# Etsy Scraper
A simple web scraper for gathering product data from a particular vendor, and outputting it as a CSV file. 

## Technology
- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [JSON2CSV](https://www.npmjs.com/package/json2csv)

## Getting started
1. Install dependencies by running `yarn install` from the project root.
2. On lines 4 and 5 of the `pageScraper.js` file, replace the `sellerName` and `countryCode` with your own data.
3. Run `node index.js` to start the script.
4. When complete, look for `scrapedoutput.csv` output file.
