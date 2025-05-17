const puppeteer = require('puppeteer')
const fs = require('fs')

const booksArray = []

const scraper = async (url) => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(url)
  await page.setViewport({ width: 1200, height: 800 })

  repeat(page, browser)
}

const repeat = async (page, browser) => {
  const arrayDivs = await page.$$('#gf-products .spf-product-card')

  for (const bookDiv of arrayDivs) {
    let title = await bookDiv.$eval('.spf-product-card__title', (el) =>
      el.textContent.trim()
    )
    let price = await bookDiv.$eval('.spf-product-card__price', (el) =>
      el.textContent.trim()
    )
    let img = await bookDiv.$eval('img', (el) => el.src)

    const book = {
      title,
      price,
      img
    }

    booksArray.push(book)
  }

  const nextLink = await page.$('a[rel="next"]')
  if (nextLink) {
    await nextLink.click()
    await page.waitForNavigation()
    await repeat(page, browser)
  }
  if (!nextLink) {
    write(booksArray)
    await browser.close()
  }
}

const write = (booksArray) => {
  fs.writeFile('products.json', JSON.stringify(booksArray, null, 2), () => {
    console.log('The file has been saved!')
  })
}

scraper('https://booksofwonder.com/collections/artwork-new?gf_17179=9.95%3A20')
