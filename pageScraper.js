const countryCode = "ca"
const sellerName = "YOUR_USERNAME"

let scrapedData = []

const scraperObject = {
  url: `https://etsy.com/${countryCode}/shop/${sellerName}`,
  async scraper(browser) {
    let page = await browser.newPage()
    console.log(`Navigating to ${this.url}...`)
    await page.goto(this.url)
    await page.waitForSelector(".shop-home")
    let urls = await page.$$eval("div.v2-listing-card", links => {
      links = links.map(el => el.querySelector("a").href)
      console.log("Links: ", links)
      return links
    })
    let pagePromise = (link) => new Promise(async(resolve, reject) => {
      let dataObj = {}
      let newPage = await browser.newPage()
      await newPage.goto(link)
      dataObj["title"] = await newPage.$eval("#listing-page-cart > div.wt-mb-xs-2 > h1", text => text.textContent)
      dataObj["price"] = await newPage.$eval("#listing-page-cart > div.align-buybox > div > div > div > div > p", text => text.textContent)
      resolve(dataObj)
      await newPage.close()
    });

    for(let link in urls){
      let currentPageData = await pagePromise(urls[link])
      scrapedData.push(currentPageData)
      console.log(currentPageData) // Debugging
    }
  }
}

module.exports = scraperObject;
