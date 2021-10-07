const countryCode = "ca"
const sellerName = "StayFinePersonalized"

let scrapedData = []
let formattedData = []

const scraperObject = {
  url: `https://etsy.com/${countryCode}/shop/${sellerName}`,
  async scraper(browser) {
    let page = await browser.newPage()
    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)
    await page.waitForSelector(".shop-home")
    let urls = await page.$$eval("div.v2-listing-card", links => {
      links = links.map(el => el.querySelector("a").href)
      console.log("Links: ", links) // Debugging
      return links
    })
    let pagePromise = (link) => new Promise(async(resolve, reject) => {
      let dataObj = {}
      let newPage = await browser.newPage()
      await newPage.goto(link)
      console.log(`Navigating to ${link}...`)
      dataObj["title"] = await newPage.$eval("#listing-page-cart > div.wt-mb-xs-2 > h1", text => text.textContent)
      dataObj["price"] = await newPage.$eval("#listing-page-cart > div > div > div > div > div > p", text => text.textContent)
      resolve(dataObj)
      reject(dataObj)
      await newPage.close()
    });

    for(let link in urls){
      let currentPageData = await pagePromise(urls[link])
      scrapedData.push(currentPageData)
    }

    for (let data of scrapedData) {
      let title = data.title
      if (title) {
        title.toString()
        title.trim()
        title = title.slice(29) // Removes 'read the full title'
        console.log("Stringified Title:  ", title) // Debugging
      }
      let price = data.price
      if (price) {
        price.toString()
        price.trim()
        price = price.slice(67, 72)
        price = price.trim()
        if (price.length > 5) {
          price = Number(price)
        }
        console.log("Numberified Price:  ", price) // Debugging
      }
      formattedData.push({price, title})

    }
    console.log("formattedData:  ", formattedData)
  }
}

module.exports = scraperObject;
