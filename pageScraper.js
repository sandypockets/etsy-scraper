const { Parser } = require('json2csv')
const fsPromises = require('fs/promises')

const sellerName = "StayFinePersonalized"
const countryCode = "ca"

const scraperObject = {
  url: `https://etsy.com/${countryCode}/shop/${sellerName}`,
  scrapedData: [],
  formattedData: [],
  toCsv: function(jsonData) {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(jsonData)
    // console.log("CSV Output:  ", csv) // Debugging
    fsPromises.writeFile("./scrapedoutput.csv", csv)
      .then(() => { console.log("CSV is ready.") })
      .catch((err) => { console.error(err) })
      .finally(() => { process.exit() })
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
      await page.waitForSelector("#content")

      dataObj["url"] = link
      dataObj["title"] = await newPage.$eval("#listing-page-cart > div.wt-mb-xs-2 > h1", text => text.textContent)
      dataObj["price"] = await newPage.$eval("#listing-page-cart > div > div > div > div > div > p", text => text.textContent)
      // Not all products are on sale
      // dataObj["originalPrice"] = await newPage.$eval("#listing-page-cart > div > div > div > div > div > p.wt-text-strikethrough", text => text.textContent)
      dataObj["numberOfSales"] = await newPage.$eval("#listing-page-cart > div > div > div > div > span.wt-text-caption", text => text.textContent)
      dataObj["description"] = await newPage.$eval("#wt-content-toggle-product-details-read-more > p", text => text.textContent)
      dataObj["processingTime"] = await newPage.$eval("#shipping-variant-div > div > div.wt-grid > div > p", text => text.textContent)
      dataObj["shippingCost"] = await newPage.$eval("span.currency-value", text => text.textContent)

      await page.waitForSelector("#reviews")
      console.log(`Navigating to reviews...`)
      // Works, but not all reviews have text. Some only contain a rating, which throws an error
      // dataObj["reviewOne"] = await newPage.$eval("#review-preview-toggle-0", text => text.textContent)
      // dataObj["reviewTwo"] = await newPage.$eval("#review-preview-toggle-1", text => text.textContent)
      // dataObj["reviewThree"] = await newPage.$eval("#review-preview-toggle-2", text => text.textContent)
      // dataObj["reviewFour"] = await newPage.$eval("p#review-preview-toggle-3", text => text.textContent)

      // Currently returning null even if not null
      for (let i = 0; i <= 4; i++) {
        const reviewExists = await page.$(`#review-preview-toggle-${i}`)
        if (reviewExists !== null) {
          dataObj["reviews"][`review${i}`] = await newPage.$eval(`#review-preview-toggle-${i}`, text => text.textContent)
        }

      }
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
      let reviews = data.reviews

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

      // let originalPrice = data.originalPrice.toString().trim()
      let shippingCost = data.shippingCost.toString().trim()
      // Represents how many sales the seller has in total, not the number of products
      let numberOfSales = data.numberOfSales.toString().trim()
      let description = data.description.toString().trim()
      let processingTime = data.processingTime.toString().trim()

      this.formattedData.push({
        title, price, url, description, numberOfSales,
        processingTime, shippingCost, reviews
      })

    }
    console.log("The CSV is being prepared...")
    this.toCsv(this.formattedData)
  }
}

module.exports = scraperObject;
