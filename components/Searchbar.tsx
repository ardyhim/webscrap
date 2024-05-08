"use client"

import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

const isValidWebsiteProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(
      hostname.includes('amazon.com') || 
      hostname.includes ('amazon.') || 
      hostname.endsWith('amazon') ||
      hostname.includes('newegg.com') || 
      hostname.includes ('newegg.') || 
      hostname.endsWith('newegg') ||
      hostname.includes('microcenter.com') || 
      hostname.includes ('microcenter.') || 
      hostname.endsWith('microcenter') ||
      hostname.includes('target.com') || 
      hostname.includes ('target.') || 
      hostname.endsWith('target') ||
      hostname.includes('bestbuy.com') || 
      hostname.includes ('bestbuy.') || 
      hostname.endsWith('bestbuy')
      // hostname.includes('walmart.com') || 
      // hostname.includes ('walmart.') || 
      // hostname.endsWith('walmart') ||
      // hostname.includes('homedepod.com') || 
      // hostname.includes ('homedepod.') || 
      // hostname.endsWith('homedepod') ||
      // hostname.includes('lowes.com') || 
      // hostname.includes ('lowes.') || 
      // hostname.endsWith('lowes')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [siteCategory, setSiteCategory] = useState('amazon');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidWebsiteProductURL(searchPrompt);

    if(!isValidLink) return alert('Please provide a valid Amazon link')

    try {
      setIsLoading(true);

      // Scrape the product page
      const product = await scrapeAndStoreProduct(searchPrompt, siteCategory);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      className="flex flex-wrap gap-4 mt-12" 
      onSubmit={handleSubmit}
    >
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />

        <select id="site"
          className="rounded-lg border p-2"
          value={siteCategory}
          defaultValue="amazon"
          onChange={(e) => setSiteCategory(e.target.value)}
        >
          <option value="amazon">Amazon</option>
          <option value="newegg">Newegg</option>
          <option value="bestbuy">Bestbuy</option>
          <option value="microcenter">Microcenter</option>
          <option value="homedepod">Homedepod</option>
          <option value="target">Target</option>
          <option value="walmart">Walmart</option>
          <option value="lowes">Lowes</option>
        </select>

      <button 
        type="submit" 
        className="searchbar-btn"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar