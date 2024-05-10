"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;

  try {
    // Fetch the product page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
      },
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: username,
          password: password,
        },
      }
    });
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount:100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}

export async function scrapeNeweggProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;

  try {
    // Fetch the product page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
      },
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: username,
          password: password,
        },
      }
    });
    const $ = cheerio.load(response.data);

    // Extract the product
    const title = $('.product-title').text().trim();
    const currentPrice = $('.price>.price-current').first().text().trim().replace('$', '').replace(',', '');
    const originalPrice = $('.price>.price-current').eq(1).text().trim().replace('$', '').replace(',', '');
    const currency = $('.price>.price-current').eq(0).text().trim()[0];
    const discountRate = $('.price>.price-save-percent').text().trim();
    const description = $('.product-bullets>ul>li').text().trim();
    const image = $('.product-view-img-original').attr('src');
    let outOfStock = false;
  
    const data = {
      url,
      currency: currency,
      image: image || '',
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}

export async function scrapeBestbuyProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;

  try {
    // Fetch the product page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
      },
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: username,
          password: password,
        },
      }
    });
    const $ = cheerio.load(response.data);

    const title = $('.sku-title').text().trim();
    const currentPrice = $('.priceView-customer-price>span').first().text().trim().replace('$', '').replace(',', '');
    const originalPrice = $('.pricing-price__regular-price').text().trim().replace(/\s+/g, " ").split('The previous price was')[1].replace('$', '');
    const currency = $('.priceView-customer-price>span').first().text().trim()[0];
    const discountRate = Math.round(Number(currentPrice) / Number(originalPrice) * 100);
    const image = $('.primary-image').attr('src');
    let outOfStock = false;
    let description = [];
    for (let i = 0; i < $('.zebra-list-item>.zebra-row').length; i++) {
      description.push($('.zebra-list-item>.zebra-row').eq(i).text().trim().replace('\n', ':').replace(/\s+/g, " "));
    }
    const data = {
      url,
      currency: currency,
      image: image || '',
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: discountRate,
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description: description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}

export async function scrapeMicrocenterProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  try {
    // Fetch the product page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
      },
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: username,
          password: password,
        },
      }
    });
    const $ = cheerio.load(response.data);

    const title = $('.product-header').text().trim().split(';')[0];
    const currentPrice = $('#pricing').attr('content');
    const originalPrice = $('.standardDiscount>strike').eq(1).text().trim().replace('Original price $', '');
    const currency = $('.standardDiscount>strike').eq(1).text().trim().replace('Original price ', '')[0];
    const priceDifference = Number(originalPrice) - Number(currentPrice);
    const discountRate = (priceDifference / Number(originalPrice)) * 100;
    const image = $('.productImageZoom').attr('src');
    const el = [...$("script")].find(e =>
      $(e).text().includes('"reviewCount":')
    );
    const meta = JSON.parse($(el).text().replace(/\r\n|\n|\r/g, ''))
    const reviewsCount = meta.aggregateRating.reviewCount;
    let description = meta.description;
    let outOfStock = false;
    const data = {
      url,
      currency: currency,
      image: image || '',
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Math.round(discountRate),
      category: 'microcenter',
      reviewsCount: Number(reviewsCount),
      stars: Math.round(meta.aggregateRating.ratingValue),
      isOutOfStock: outOfStock || false,
      description: description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    return data;
  } catch (error: any) {
    console.log(error);
  }
}

export async function scrapeBhphotovideoProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  try {
    // Fetch the product page
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
      },
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: username,
          password: password,
        },
      }
    });
    const $ = cheerio.load(response.data);

    const el = [...$("script")].find(e =>
      $(e).text().includes('"ratingValue":')
    );
    const meta = JSON.parse($(el).text())
    const title = meta.name;
    const currentPrice = meta.offers.price;
    const image = meta.image;
    const originalPrice = $('div[data-selenium="strikeThroughPrice"]').text();
    const currency = currentPrice[0];
    const priceDifference = Number(originalPrice) - currentPrice;
    const discountRate = (priceDifference / Number(originalPrice)) * 100;
    const outOfStock = false;
  
    const stars = meta.aggregateRating.ratingValue;
    const description = meta.description;
    const reviewsCount = meta.aggregateRating.reviewCount;
    const data = {
      url,
      currency: currency,
      image: image || '',
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Math.round(discountRate),
      category: 'microcenter',
      reviewsCount: Number(reviewsCount),
      stars: Math.round(meta.aggregateRating.ratingValue),
      isOutOfStock: outOfStock || false,
      description: description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    return data;
  } catch (error: any) {
    console.log(error);
  }
}