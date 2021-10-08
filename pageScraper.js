const countryCode = "ca"
const sellerName = "StayFinePersonalized"
const { Parser } = require('json2csv')

const scraperObject = {
  url: `https://etsy.com/${countryCode}/shop/${sellerName}`,
  scrapedData: [],
  formattedData: [],
  toCsv: function(jsonData) {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(jsonData)
    console.log("CSV Output:  ", csv)
  },
  async scraper(browser) {
    let page = await browser.newPage()
    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)
    await page.waitForSelector(".shop-home")
    let urls = await page.$$eval("div.v2-listing-card", links => {
      links = links.map(el => el.querySelector("a").href)
      return links
    })

    let pagePromise = (link) => new Promise(async(resolve, reject) => {
      let dataObj = {}
      let newPage = await browser.newPage()
      await newPage.goto(link)
      console.log(`Navigating to ${link}...`)
      dataObj["title"] = await newPage.$eval("#listing-page-cart > div.wt-mb-xs-2 > h1", text => text.textContent)
      dataObj["price"] = await newPage.$eval("#listing-page-cart > div > div > div > div > div > p", text => text.textContent)
      dataObj["url"] = link
      resolve(dataObj)
      reject(dataObj)
      await newPage.close()
    });

    for(let link in urls){
      let currentPageData = await pagePromise(urls[link])
      this.scrapedData.push(currentPageData)
    }

    for (let data of this.scrapedData) {
      let url = data.url
      let title = data.title
      if (title) {
        title.toString().trim()
        title = title.slice(28) // Removes 'read the full title'
        title = title.split("\n")
        title = title[0]
      }
      let price = data.price
      if (price) {
        price.toString().trim()
        price = price.slice(67, 72)
        price = price.trim()
        if (price.length > 5) {
          price = Number(price)
        }
      }
      this.formattedData.push({ price, title, url })

    }
    console.log("formattedData:  ", this.formattedData)
    this.toCsv(this.formattedData)
  }
}

module.exports = scraperObject;
