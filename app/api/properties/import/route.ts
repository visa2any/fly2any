import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { callGroq } from '@/lib/ai/groq-client';
import * as cheerio from 'cheerio';

// ─────────────────────────────────────────────────────────────────────────────
// Platform detection
// ─────────────────────────────────────────────────────────────────────────────
type Platform = 'airbnb' | 'booking' | 'vrbo' | 'generic';

function detectPlatform(url: string): Platform {
  const u = url.toLowerCase();
  if (u.includes('airbnb')) return 'airbnb';
  if (u.includes('booking.com')) return 'booking';
  if (u.includes('vrbo.com') || u.includes('homeaway.com')) return 'vrbo';
  return 'generic';
}

// ─────────────────────────────────────────────────────────────────────────────
// URL normalization per platform
// ─────────────────────────────────────────────────────────────────────────────
function normalizeUrl(url: string, platform: Platform): string {
  if (platform === 'airbnb') {
    // Host editor URL → public rooms URL
    if (url.includes('/hosting/listings/editor/')) {
      const match = url.match(/\/editor\/(\d+)/);
      if (match?.[1]) {
        const base = new URL(url).origin;
        url = `${base}/rooms/${match[1]}`;
        console.log(`[import] Airbnb host URL → public: ${url}`);
      }
    }
    // Ensure we're using English locale for consistent parsing
    if (!url.includes('locale=')) {
      url += (url.includes('?') ? '&' : '?') + 'locale=en';
    }
  }
  if (platform === 'booking') {
    // Ensure English locale
    if (!url.includes('lang=') && !url.includes('/en-us/') && !url.includes('/en-gb/')) {
      url += (url.includes('?') ? '&' : '?') + 'lang=en-us';
    }
  }
  if (platform === 'vrbo') {
    // Ensure English
    if (!url.includes('locale=')) {
      url += (url.includes('?') ? '&' : '?') + 'locale=en_US';
    }
  }
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared image helpers
// ─────────────────────────────────────────────────────────────────────────────
const IMG_BLACKLIST = ['icon', 'logo', 'avatar', 'sprite', '1x1', 'pixel', 'tracking', 'badge', 'flag', 'emoji', 'svg+xml', 'profile_pic', 'user_pic', 'gravatar', '/Portrait', '/User-', '/User/', 'user_portrait', 'host_photo', 'host_image', 'profile_picture', 'facebook.com', 'fbcdn.net', 'googleusercontent.com/a/', 'platform-lookaside', 'graph.facebook'];

function isValidPropertyImage(url: string): boolean {
  const u = url.toLowerCase();
  if (!u.startsWith('http')) return false;
  if (IMG_BLACKLIST.some(b => u.includes(b.toLowerCase()))) return false;
  // Airbnb host photos: muscache.com/im/pictures/user/ or /Portrait/
  if (u.includes('muscache.com') && (u.includes('/user/') || u.includes('/user-') || u.includes('/portrait'))) return false;
  // Filter tiny images (likely icons/avatars) by dimension hints in URL
  const sizeMatch = u.match(/(\d+)x(\d+)/);
  if (sizeMatch && (parseInt(sizeMatch[1]) < 100 || parseInt(sizeMatch[2]) < 100)) return false;
  return true;
}

function dedupeImages(images: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const img of images) {
    // Normalize: strip query params for dedup comparison, but keep original URL
    const key = img.split('?')[0].replace(/\/im\/resize.*$/, '').replace(/\?.*$/, '');
    if (!seen.has(key)) {
      seen.add(key);
      result.push(img);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deep JSON scanner — finds nested values in large embedded JS objects
// ─────────────────────────────────────────────────────────────────────────────
function deepFind(obj: any, predicate: (key: string, value: any) => boolean, maxDepth = 8): any[] {
  const results: any[] = [];
  function walk(o: any, depth: number) {
    if (depth > maxDepth || !o || typeof o !== 'object') return;
    for (const key of Object.keys(o)) {
      if (predicate(key, o[key])) results.push(o[key]);
      if (typeof o[key] === 'object') walk(o[key], depth + 1);
    }
  }
  walk(obj, 0);
  return results;
}

function deepFindFirst(obj: any, keys: string[], maxDepth = 10): any {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'object') {
      const found = deepFindFirst(obj[k], keys, maxDepth - 1);
      if (found !== undefined && maxDepth > 0) return found;
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// AIRBNB EXTRACTOR — Parses embedded __NEXT_DATA__ / bootstrapData / deferred state
// ─────────────────────────────────────────────────────────────────────────────
function extractAirbnbData(html: string, $: cheerio.CheerioAPI): any | null {
  // Airbnb embeds listing data in script tags. Try multiple known patterns:
  const scriptPatterns = [
    /data-deferred-state-0[^>]*>(.*?)<\/script>/s,
    /data-deferred-state[^>]*>(.*?)<\/script>/s,
    /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s,
  ];

  let embeddedData: any = null;

  // Method 1: Parse deferred state scripts
  for (const pattern of scriptPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        embeddedData = JSON.parse(match[1]);
        console.log('[import] Airbnb: Found deferred state data');
        break;
      } catch { /* continue */ }
    }
  }

  // Method 2: Find bootstrapData in inline scripts
  if (!embeddedData) {
    const bootstrapMatch = html.match(/bootstrapData\s*=\s*(\{.+?\});\s*<\/script>/s);
    if (bootstrapMatch?.[1]) {
      try {
        embeddedData = JSON.parse(bootstrapMatch[1]);
        console.log('[import] Airbnb: Found bootstrapData');
      } catch { /* continue */ }
    }
  }

  // Method 3: Find any large JSON object in script tags containing listing keywords
  if (!embeddedData) {
    const allScripts: string[] = [];
    $('script:not([src])').each((_, el) => {
      const content = $(el).html() || '';
      if (content.length > 2000 && (content.includes('listingId') || content.includes('pdpSections') || content.includes('listing'))) {
        allScripts.push(content);
      }
    });
    for (const script of allScripts) {
      // Try to extract the largest JSON-like object
      const jsonMatches = script.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g);
      if (jsonMatches) {
        // Sort by length, try the largest first
        const sorted = jsonMatches.sort((a, b) => b.length - a.length);
        for (const candidate of sorted.slice(0, 3)) {
          if (candidate.length < 1000) continue;
          try {
            const parsed = JSON.parse(candidate);
            if (parsed.listing || parsed.pdpSections || parsed.niobeMinimalClientData) {
              embeddedData = parsed;
              console.log('[import] Airbnb: Found listing data in script tag');
              break;
            }
          } catch { /* continue */ }
        }
        if (embeddedData) break;
      }
    }
  }

  if (!embeddedData) {
    console.log('[import] Airbnb: No embedded data found, will use AI fallback');
    return null;
  }

  // ── Navigate Airbnb's nested structure to find listing data ──
  const result: any = {
    images: [] as string[],
    amenities: [] as string[],
    houseRules: [] as string[],
  };

  // --- Title ---
  result.name = deepFindFirst(embeddedData, ['title', 'name', 'listingTitle']);
  if (!result.name) {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    result.name = ogTitle || '';
  }

  // --- Description ---
  result.description = deepFindFirst(embeddedData, ['description', 'listingDescription', 'summary']);
  // Airbnb sometimes nests description in htmlDescription.htmlText
  if (!result.description) {
    const htmlDesc = deepFind(embeddedData, (k) => k === 'htmlDescription', 6);
    if (htmlDesc.length > 0) {
      result.description = htmlDesc[0]?.htmlText?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    }
  }
  if (!result.description) {
    result.description = $('meta[property="og:description"]').attr('content') || '';
  }

  // --- Images (the critical fix) ---
  // Pattern 1: photos array with baseUrl or pictureUrl
  const photoArrays = deepFind(embeddedData, (k) => k === 'photos' && Array.isArray(embeddedData[k] ?? null), 8);
  // Also search for mediaItems, images, photoUrls
  const allPhotoKeys = ['photos', 'photoUrls', 'mediaItems', 'images', 'listingImages', 'photoTour'];
  for (const key of allPhotoKeys) {
    const found = deepFind(embeddedData, (k, v) => k === key && Array.isArray(v), 10);
    for (const arr of found) {
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (typeof item === 'string' && isValidPropertyImage(item)) {
          result.images.push(item);
        } else if (item?.baseUrl) {
          result.images.push(item.baseUrl);
        } else if (item?.pictureUrl) {
          result.images.push(item.pictureUrl);
        } else if (item?.url) {
          result.images.push(item.url);
        } else if (item?.picture) {
          result.images.push(item.picture);
        } else if (item?.large) {
          result.images.push(item.large);
        } else if (item?.scrimColor && item?.picture) {
          result.images.push(item.picture);
        }
      }
    }
  }

  // Pattern 2: Regex scan for Airbnb CDN image URLs
  const airbnbImgRegex = /https:\/\/a0\.muscache\.com\/im\/pictures\/[^\s"'<>]+/gi;
  const cdnMatches = html.match(airbnbImgRegex) || [];
  for (const img of cdnMatches) {
    if (!result.images.includes(img)) result.images.push(img);
  }
  // Also check for hosting uploads CDN
  const hostingImgRegex = /https:\/\/a0\.muscache\.com\/im\/ml\/[^\s"'<>]+/gi;
  const hostingMatches = html.match(hostingImgRegex) || [];
  for (const img of hostingMatches) {
    if (!result.images.includes(img)) result.images.push(img);
  }

  // --- Price ---
  const priceData = deepFind(embeddedData, (k) => k === 'price' || k === 'priceString' || k === 'structuredDisplayPrice' || k === 'priceBreakdown', 10);
  for (const p of priceData) {
    if (typeof p === 'number' && p > 0) {
      result.price = { amount: p, currency: 'USD' };
      break;
    }
    if (typeof p === 'string') {
      const numMatch = p.match(/[\d,.]+/);
      if (numMatch) {
        result.price = { amount: parseFloat(numMatch[0].replace(/,/g, '')), currency: detectCurrency(p) };
        break;
      }
    }
    if (typeof p === 'object' && p !== null) {
      // structuredDisplayPrice.primaryLine.price or priceBreakdown.priceItems
      const amt = p.amount || p.total || p.price;
      if (typeof amt === 'number' && amt > 0) {
        result.price = { amount: amt, currency: p.currency || p.currencyCode || 'USD' };
        break;
      }
      // Look for displayPrice string
      const displayPrice = p.primaryLine?.price || p.primaryLine?.discountedPrice || p.displayPrice;
      if (typeof displayPrice === 'string') {
        const numMatch = displayPrice.match(/[\d,.]+/);
        if (numMatch) {
          result.price = { amount: parseFloat(numMatch[0].replace(/,/g, '')), currency: detectCurrency(displayPrice) };
          break;
        }
      }
    }
  }

  // --- Specs ---
  const guestLabel = deepFind(embeddedData, (k) => k === 'personCapacity' || k === 'maxGuestCapacity' || k === 'guestCapacity', 10);
  const bedroomLabel = deepFind(embeddedData, (k) => k === 'bedroomCount' || k === 'bedrooms' || k === 'bedroomLabel', 10);
  const bedLabel = deepFind(embeddedData, (k) => k === 'bedCount' || k === 'beds' || k === 'bedLabel', 10);
  const bathLabel = deepFind(embeddedData, (k) => k === 'bathroomCount' || k === 'bathrooms' || k === 'bathroomLabel' || k === 'bathroomCount', 10);

  result.specs = {
    maxGuests: extractNumber(guestLabel[0]) || 2,
    bedrooms: extractNumber(bedroomLabel[0]) || 1,
    beds: extractNumber(bedLabel[0]) || 1,
    bathrooms: extractNumber(bathLabel[0]) || 1,
  };

  // Fallback: parse from overview section text like "4 guests · 2 bedrooms · 3 beds · 1 bath"
  const overviewTexts = deepFind(embeddedData, (k) => k === 'overviewItems' || k === 'listingDetails', 8);
  if (result.specs.maxGuests <= 2 && overviewTexts.length > 0) {
    const overviewStr = JSON.stringify(overviewTexts).toLowerCase();
    const guestM = overviewStr.match(/(\d+)\s*guest/);
    const bedroomM = overviewStr.match(/(\d+)\s*bedroom/);
    const bedM = overviewStr.match(/(\d+)\s*bed(?!room)/);
    const bathM = overviewStr.match(/(\d+)\s*bath/);
    if (guestM) result.specs.maxGuests = parseInt(guestM[1]);
    if (bedroomM) result.specs.bedrooms = parseInt(bedroomM[1]);
    if (bedM) result.specs.beds = parseInt(bedM[1]);
    if (bathM) result.specs.bathrooms = parseInt(bathM[1]);
  }

  // --- Amenities ---
  const amenityGroups = deepFind(embeddedData, (k, v) => (k === 'amenities' || k === 'listingAmenities' || k === 'previewAmenities') && Array.isArray(v), 10);
  for (const group of amenityGroups) {
    if (!Array.isArray(group)) continue;
    for (const item of group) {
      if (typeof item === 'string') {
        result.amenities.push(item);
      } else if (item?.title) {
        result.amenities.push(item.title);
      } else if (item?.name) {
        result.amenities.push(item.name);
      }
      // Airbnb sometimes nests amenities inside groups
      if (item?.amenities && Array.isArray(item.amenities)) {
        for (const sub of item.amenities) {
          if (typeof sub === 'string') result.amenities.push(sub);
          else if (sub?.title) result.amenities.push(sub.title);
          else if (sub?.name) result.amenities.push(sub.name);
        }
      }
    }
  }
  result.amenities = [...new Set(result.amenities)].slice(0, 30);

  // --- Location ---
  const lat = deepFindFirst(embeddedData, ['lat', 'latitude']);
  const lng = deepFindFirst(embeddedData, ['lng', 'longitude']);
  result.location = {
    latitude: typeof lat === 'number' ? lat : 0,
    longitude: typeof lng === 'number' ? lng : 0,
  };

  const city = deepFindFirst(embeddedData, ['city', 'localizedCity', 'cityName']);
  const country = deepFindFirst(embeddedData, ['country', 'localizedCountry', 'countryName', 'countryCode']);
  const neighborhood = deepFindFirst(embeddedData, ['neighborhood', 'localizedNeighborhood', 'neighborhoodName']);
  const state = deepFindFirst(embeddedData, ['state', 'stateCode', 'localizedState']);

  result.address = {
    city: typeof city === 'string' ? city : '',
    country: typeof country === 'string' ? country : '',
    neighborhood: typeof neighborhood === 'string' ? neighborhood : '',
    state: typeof state === 'string' ? state : '',
    full_address: [neighborhood, city, state, country].filter(Boolean).join(', '),
  };

  // If city still empty, try from og:title or location strings
  if (!result.address.city) {
    const locationStr = deepFindFirst(embeddedData, ['locationTitle', 'location', 'localizedCityName']);
    if (typeof locationStr === 'string') {
      result.address.city = locationStr.split(',')[0]?.trim() || '';
      result.address.full_address = locationStr;
    }
  }

  // --- House Rules ---
  const rules = deepFind(embeddedData, (k, v) => (k === 'houseRules' || k === 'additionalHouseRules' || k === 'guestControls') && Array.isArray(v), 10);
  for (const ruleArr of rules) {
    if (!Array.isArray(ruleArr)) continue;
    for (const rule of ruleArr) {
      if (typeof rule === 'string') result.houseRules.push(rule);
      else if (rule?.title) result.houseRules.push(rule.title);
    }
  }
  result.houseRules = [...new Set(result.houseRules)];

  // --- Check-in / Check-out ---
  result.checkIn = deepFindFirst(embeddedData, ['checkInTime', 'checkinTime', 'checkIn']) || '';
  result.checkOut = deepFindFirst(embeddedData, ['checkOutTime', 'checkoutTime', 'checkOut']) || '';
  // Normalize time strings
  if (result.checkIn && typeof result.checkIn === 'string') {
    const timeMatch = result.checkIn.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) result.checkIn = normalizeTime(timeMatch[0]);
  }
  if (result.checkOut && typeof result.checkOut === 'string') {
    const timeMatch = result.checkOut.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) result.checkOut = normalizeTime(timeMatch[0]);
  }

  // --- Host ---
  const hostName = deepFindFirst(embeddedData, ['hostName', 'host', 'hostDisplayName']);
  const isSuperhost = deepFind(embeddedData, (k) => k === 'isSuperhost' || k === 'superhost', 8);
  result.host = {
    name: typeof hostName === 'string' ? hostName : '',
    isSuperhost: isSuperhost.some(v => v === true),
  };

  // --- Property Type ---
  const roomType = deepFindFirst(embeddedData, ['roomType', 'roomTypeCategory', 'propertyType', 'propertyTypeCategory']);
  result.propertyType = inferPropertyTypeFromText(
    `${roomType || ''} ${result.name || ''} ${result.description || ''}`.toLowerCase()
  );

  // --- Rating ---
  const rating = deepFindFirst(embeddedData, ['avgRating', 'overallRating', 'guestSatisfactionOverall', 'starRating']);
  const reviewCount = deepFindFirst(embeddedData, ['reviewCount', 'visibleReviewCount', 'reviewsCount']);
  if (typeof rating === 'number') result.rating = rating;
  if (typeof reviewCount === 'number') result.reviewCount = reviewCount;

  console.log(`[import] Airbnb extracted: title=${!!result.name}, desc=${(result.description||'').length}ch, images=${result.images.length}, price=${result.price?.amount}, specs=${JSON.stringify(result.specs)}, amenities=${result.amenities.length}`);

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING.COM EXTRACTOR — Parses JSON-LD + embedded b_something data objects
// ─────────────────────────────────────────────────────────────────────────────
function extractBookingData(html: string, $: cheerio.CheerioAPI): any | null {
  const result: any = {
    images: [] as string[],
    amenities: [] as string[],
    houseRules: [] as string[],
  };

  // Booking.com uses rich JSON-LD (Hotel schema) — extract it first
  let jsonLd: any = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      // Handle @graph arrays
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (['Hotel', 'LodgingBusiness', 'Apartment', 'VacationRental', 'Resort', 'BedAndBreakfast', 'Hostel', 'Motel'].some(t => (item['@type'] || '').includes(t))) {
            jsonLd = { ...jsonLd, ...item };
          }
        }
      }
      if (['Hotel', 'LodgingBusiness', 'Apartment', 'VacationRental', 'Resort', 'BedAndBreakfast', 'Hostel', 'Motel', 'Product'].some(t => (data['@type'] || '').includes(t))) {
        jsonLd = { ...jsonLd, ...data };
      }
    } catch { /* ignore */ }
  });

  // Title & Description
  result.name = jsonLd.name || $('meta[property="og:title"]').attr('content') || $('h2#hp_hotel_name').text().trim() || '';
  result.description = jsonLd.description || $('meta[property="og:description"]').attr('content') || '';

  // --- Images ---
  // Booking.com stores hotel images in data-highres attributes and in a JS config object
  $('img[data-highres]').each((_, el) => {
    const highRes = $(el).attr('data-highres');
    if (highRes && isValidPropertyImage(highRes)) result.images.push(highRes);
  });
  // Also scan for bstatic.com CDN URLs (Booking.com's image CDN)
  const bstaticRegex = /https?:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/max\d+\/[^\s"'<>]+/gi;
  const bstaticMatches = html.match(bstaticRegex) || [];
  for (const img of bstaticMatches) result.images.push(img);
  // Also check for the "square" images variant
  const bstaticSquareRegex = /https?:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/square\d+\/[^\s"'<>]+/gi;
  const squareMatches = html.match(bstaticSquareRegex) || [];
  for (const img of squareMatches) {
    // Convert square to max1280 for higher quality
    result.images.push(img.replace(/\/square\d+\//, '/max1280x900/'));
  }
  // JSON-LD images
  if (jsonLd.image) {
    const imgs = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image];
    for (const img of imgs) {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && isValidPropertyImage(url)) result.images.push(url);
    }
  }
  // OG image
  const ogImg = $('meta[property="og:image"]').attr('content');
  if (ogImg) result.images.push(ogImg);

  // --- Address ---
  result.address = { city: '', country: '', neighborhood: '', state: '', full_address: '' };
  if (jsonLd.address) {
    if (typeof jsonLd.address === 'object') {
      result.address.city = jsonLd.address.addressLocality || '';
      result.address.country = jsonLd.address.addressCountry || '';
      result.address.state = jsonLd.address.addressRegion || '';
      result.address.neighborhood = '';
      result.address.full_address = [jsonLd.address.streetAddress, jsonLd.address.addressLocality, jsonLd.address.addressRegion, jsonLd.address.postalCode, jsonLd.address.addressCountry].filter(Boolean).join(', ');
      result.address.postalCode = jsonLd.address.postalCode || '';
    } else if (typeof jsonLd.address === 'string') {
      result.address.full_address = jsonLd.address;
    }
  }

  // --- Geo ---
  result.location = { latitude: 0, longitude: 0 };
  if (jsonLd.geo) {
    result.location.latitude = Number(jsonLd.geo.latitude) || 0;
    result.location.longitude = Number(jsonLd.geo.longitude) || 0;
  }

  // --- Price ---
  if (jsonLd.priceRange) {
    const numMatch = jsonLd.priceRange.match(/[\d,.]+/);
    if (numMatch) result.price = { amount: parseFloat(numMatch[0].replace(/,/g, '')), currency: detectCurrency(jsonLd.priceRange) };
  } else if (jsonLd.offers) {
    const offer = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
    if (offer?.price) result.price = { amount: Number(offer.price), currency: offer.priceCurrency || 'USD' };
  }
  // Fallback: scan HTML for price elements
  if (!result.price) {
    const priceEl = $('[data-testid="price-and-discounted-price"]').text() || $('.bui-price-display__value').text() || $('[class*="price"]').first().text();
    if (priceEl) {
      const numMatch = priceEl.match(/[\d,.]+/);
      if (numMatch) result.price = { amount: parseFloat(numMatch[0].replace(/,/g, '')), currency: detectCurrency(priceEl) };
    }
  }

  // --- Star Rating ---
  result.starRating = jsonLd.starRating?.ratingValue || null;

  // --- Amenities ---
  if (jsonLd.amenityFeature) {
    const features = Array.isArray(jsonLd.amenityFeature) ? jsonLd.amenityFeature : [jsonLd.amenityFeature];
    for (const f of features) {
      const name = typeof f === 'string' ? f : f?.name;
      if (name) result.amenities.push(name);
    }
  }
  // Scrape from facility list in HTML
  $('[data-testid="property-most-popular-facilities-wrapper"] li, .hp_desc_important_facilities li, .facilitiesChecklist__row').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 50) result.amenities.push(text);
  });
  result.amenities = [...new Set(result.amenities)].slice(0, 30);

  // --- Specs ---
  result.specs = {
    maxGuests: 2,
    bedrooms: Number(jsonLd.numberOfRooms) || Number(jsonLd.numberOfBedrooms) || 1,
    beds: Number(jsonLd.numberOfBeds) || 1,
    bathrooms: Number(jsonLd.numberOfBathroomsTotal) || 1,
  };
  // Parse from room description text
  const roomText = ($('.hprt-roomtype-icon-link').first().text() + ' ' + $('[data-testid="facility-group-item"]').text()).toLowerCase();
  const guestM = roomText.match(/(\d+)\s*guest/);
  const bedroomM = roomText.match(/(\d+)\s*bedroom/);
  const bedM = roomText.match(/(\d+)\s*bed(?!room)/);
  const bathM = roomText.match(/(\d+)\s*bath/);
  if (guestM) result.specs.maxGuests = parseInt(guestM[1]);
  if (bedroomM) result.specs.bedrooms = parseInt(bedroomM[1]);
  if (bedM) result.specs.beds = parseInt(bedM[1]);
  if (bathM) result.specs.bathrooms = parseInt(bathM[1]);

  // --- Check-in / Check-out ---
  result.checkIn = jsonLd.checkinTime || '';
  result.checkOut = jsonLd.checkoutTime || '';
  // Try scraping from the page
  if (!result.checkIn) {
    const checkinText = $('[data-testid="check-in-time"]').text() || $(':contains("Check-in")').filter((_, el) => $(el).text().match(/\d{1,2}:\d{2}/)).first().text();
    const timeM = checkinText.match(/(\d{1,2}:\d{2})/);
    if (timeM) result.checkIn = timeM[1];
  }
  if (!result.checkOut) {
    const checkoutText = $('[data-testid="check-out-time"]').text() || $(':contains("Check-out")').filter((_, el) => $(el).text().match(/\d{1,2}:\d{2}/)).first().text();
    const timeM = checkoutText.match(/(\d{1,2}:\d{2})/);
    if (timeM) result.checkOut = timeM[1];
  }

  // --- House Rules (from HTML) ---
  $('[data-testid="property-house-rules"] li, .hp-description--house-rules li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 100) result.houseRules.push(text);
  });

  // --- Host ---
  result.host = { name: '', isSuperhost: false };

  // --- Property Type ---
  result.propertyType = inferPropertyTypeFromText(
    `${jsonLd['@type'] || ''} ${result.name} ${result.description}`.toLowerCase()
  );

  // --- Rating ---
  if (jsonLd.aggregateRating) {
    result.rating = Number(jsonLd.aggregateRating.ratingValue) || undefined;
    result.reviewCount = Number(jsonLd.aggregateRating.reviewCount) || undefined;
  }

  console.log(`[import] Booking.com extracted: title=${!!result.name}, desc=${(result.description||'').length}ch, images=${result.images.length}, price=${result.price?.amount}, amenities=${result.amenities.length}`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// VRBO EXTRACTOR — Parses __NEXT_DATA__ or Redux state
// ─────────────────────────────────────────────────────────────────────────────
function extractVrboData(html: string, $: cheerio.CheerioAPI): any | null {
  const result: any = {
    images: [] as string[],
    amenities: [] as string[],
    houseRules: [] as string[],
  };

  // VRBO uses __NEXT_DATA__ similar to Airbnb
  let embeddedData: any = null;
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
  if (nextDataMatch?.[1]) {
    try {
      embeddedData = JSON.parse(nextDataMatch[1]);
      console.log('[import] VRBO: Found __NEXT_DATA__');
    } catch { /* continue */ }
  }

  // Also try Redux initial state
  if (!embeddedData) {
    const reduxMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.+?\});\s*<\/script>/s);
    if (reduxMatch?.[1]) {
      try {
        embeddedData = JSON.parse(reduxMatch[1]);
        console.log('[import] VRBO: Found Redux state');
      } catch { /* continue */ }
    }
  }

  // Also check JSON-LD (VRBO sometimes has VacationRental schema)
  let jsonLd: any = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] && ['VacationRental', 'LodgingBusiness', 'House', 'Apartment', 'Hotel'].some(t => data['@type'].includes(t))) {
        jsonLd = { ...jsonLd, ...data };
      }
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item['@type'] && ['VacationRental', 'LodgingBusiness'].some(t => (item['@type'] || '').includes(t))) {
            jsonLd = { ...jsonLd, ...item };
          }
        }
      }
    } catch { /* ignore */ }
  });

  // Title & Description
  result.name = jsonLd.name || deepFindFirst(embeddedData, ['headline', 'propertyName', 'title', 'name']) || $('meta[property="og:title"]').attr('content') || '';
  result.description = jsonLd.description || deepFindFirst(embeddedData, ['description', 'summary', 'propertyDescription']) || $('meta[property="og:description"]').attr('content') || '';

  // --- Images ---
  // VRBO CDN images
  const vrboImgRegex = /https?:\/\/[^\s"'<>]*\.expedia(?:group)?\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)[^\s"'<>]*/gi;
  const vrboImgMatches = html.match(vrboImgRegex) || [];
  for (const img of vrboImgMatches) {
    if (isValidPropertyImage(img)) result.images.push(img);
  }
  // Also check embedded data for image arrays
  if (embeddedData) {
    const photoArrays = deepFind(embeddedData, (k, v) => (k === 'images' || k === 'photos' || k === 'propertyImages') && Array.isArray(v), 10);
    for (const arr of photoArrays) {
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const url = typeof item === 'string' ? item : (item?.uri || item?.url || item?.href || item?.c9PhotoUri);
        if (url && isValidPropertyImage(url)) result.images.push(url);
      }
    }
  }
  // JSON-LD images
  if (jsonLd.image) {
    const imgs = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image];
    for (const img of imgs) {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) result.images.push(url);
    }
  }
  const ogImg = $('meta[property="og:image"]').attr('content');
  if (ogImg) result.images.push(ogImg);

  // --- Address ---
  result.address = { city: '', country: '', neighborhood: '', state: '', full_address: '' };
  if (jsonLd.address && typeof jsonLd.address === 'object') {
    result.address.city = jsonLd.address.addressLocality || '';
    result.address.country = jsonLd.address.addressCountry || '';
    result.address.state = jsonLd.address.addressRegion || '';
    result.address.full_address = [jsonLd.address.streetAddress, jsonLd.address.addressLocality, jsonLd.address.addressRegion, jsonLd.address.postalCode, jsonLd.address.addressCountry].filter(Boolean).join(', ');
  } else if (embeddedData) {
    const city = deepFindFirst(embeddedData, ['city', 'cityName']);
    const country = deepFindFirst(embeddedData, ['country', 'countryCode']);
    const state = deepFindFirst(embeddedData, ['stateProvinceName', 'state']);
    if (typeof city === 'string') result.address.city = city;
    if (typeof country === 'string') result.address.country = country;
    if (typeof state === 'string') result.address.state = state;
    result.address.full_address = [city, state, country].filter(Boolean).join(', ');
  }

  // --- Geo ---
  result.location = { latitude: 0, longitude: 0 };
  if (jsonLd.geo) {
    result.location.latitude = Number(jsonLd.geo.latitude) || 0;
    result.location.longitude = Number(jsonLd.geo.longitude) || 0;
  } else if (embeddedData) {
    const lat = deepFindFirst(embeddedData, ['latitude', 'lat']);
    const lng = deepFindFirst(embeddedData, ['longitude', 'lng', 'lon']);
    if (typeof lat === 'number') result.location.latitude = lat;
    if (typeof lng === 'number') result.location.longitude = lng;
  }

  // --- Price ---
  if (jsonLd.offers) {
    const offer = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
    if (offer?.price) result.price = { amount: Number(offer.price), currency: offer.priceCurrency || 'USD' };
  }
  if (!result.price && embeddedData) {
    const priceVal = deepFindFirst(embeddedData, ['price', 'averagePrice', 'nightlyRate', 'amount']);
    if (typeof priceVal === 'number' && priceVal > 0) {
      result.price = { amount: priceVal, currency: 'USD' };
    }
  }

  // --- Specs ---
  result.specs = { maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1 };
  if (jsonLd.numberOfRooms) result.specs.bedrooms = Number(jsonLd.numberOfRooms);
  if (jsonLd.numberOfBedrooms) result.specs.bedrooms = Number(jsonLd.numberOfBedrooms);
  if (jsonLd.numberOfBathroomsTotal) result.specs.bathrooms = Number(jsonLd.numberOfBathroomsTotal);
  if (jsonLd.occupancy?.maxValue) result.specs.maxGuests = Number(jsonLd.occupancy.maxValue);
  if (embeddedData) {
    const guests = deepFindFirst(embeddedData, ['maxOccupancy', 'maxSleeps', 'sleeps', 'maxGuests']);
    const bedrooms = deepFindFirst(embeddedData, ['bedroomCount', 'bedrooms', 'numberOfBedrooms']);
    const bathrooms = deepFindFirst(embeddedData, ['bathroomCount', 'bathrooms', 'numberOfBathrooms']);
    const beds = deepFindFirst(embeddedData, ['bedCount', 'beds']);
    if (typeof guests === 'number') result.specs.maxGuests = guests;
    if (typeof bedrooms === 'number') result.specs.bedrooms = bedrooms;
    if (typeof bathrooms === 'number') result.specs.bathrooms = bathrooms;
    if (typeof beds === 'number') result.specs.beds = beds;
  }

  // --- Amenities ---
  if (jsonLd.amenityFeature) {
    const features = Array.isArray(jsonLd.amenityFeature) ? jsonLd.amenityFeature : [jsonLd.amenityFeature];
    for (const f of features) result.amenities.push(typeof f === 'string' ? f : f?.name || '');
  }
  if (embeddedData) {
    const amenityArrays = deepFind(embeddedData, (k, v) => k === 'amenities' && Array.isArray(v), 10);
    for (const arr of amenityArrays) {
      for (const item of arr) {
        if (typeof item === 'string') result.amenities.push(item);
        else if (item?.text) result.amenities.push(item.text);
        else if (item?.name) result.amenities.push(item.name);
      }
    }
  }
  result.amenities = [...new Set(result.amenities.filter(Boolean))].slice(0, 30);

  // --- Check-in / Check-out ---
  result.checkIn = jsonLd.checkinTime || deepFindFirst(embeddedData, ['checkInTime', 'checkinTime']) || '';
  result.checkOut = jsonLd.checkoutTime || deepFindFirst(embeddedData, ['checkOutTime', 'checkoutTime']) || '';

  // --- House Rules ---
  if (embeddedData) {
    const ruleArrays = deepFind(embeddedData, (k, v) => k === 'houseRules' && Array.isArray(v), 10);
    for (const arr of ruleArrays) {
      for (const rule of arr) {
        if (typeof rule === 'string') result.houseRules.push(rule);
        else if (rule?.name) result.houseRules.push(rule.name);
      }
    }
  }

  // --- Host ---
  result.host = { name: '', isSuperhost: false };
  if (embeddedData) {
    const hostName = deepFindFirst(embeddedData, ['hostName', 'ownerName', 'managerName']);
    if (typeof hostName === 'string') result.host.name = hostName;
  }

  // --- Property Type ---
  result.propertyType = inferPropertyTypeFromText(
    `${jsonLd['@type'] || ''} ${result.name} ${result.description}`.toLowerCase()
  );

  console.log(`[import] VRBO extracted: title=${!!result.name}, desc=${(result.description||'').length}ch, images=${result.images.length}, price=${result.price?.amount}, amenities=${result.amenities.length}`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC EXTRACTOR — JSON-LD + HTML scraping for any site
// ─────────────────────────────────────────────────────────────────────────────
function extractGenericData(html: string, $: cheerio.CheerioAPI): any | null {
  const result: any = {
    images: [] as string[],
    amenities: [] as string[],
    houseRules: [] as string[],
  };

  // JSON-LD extraction (comprehensive)
  let jsonLd: any = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      const relevantTypes = ['Hotel', 'LodgingBusiness', 'Resort', 'BedAndBreakfast', 'VacationRental', 'RealEstateListing', 'Product', 'Apartment', 'House', 'Hostel', 'Motel', 'Campground', 'LodgingReservation'];
      if (data['@type'] && relevantTypes.some(t => data['@type'].includes(t))) {
        jsonLd = { ...jsonLd, ...data };
      }
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item['@type'] && relevantTypes.some(t => (item['@type'] || '').includes(t))) {
            jsonLd = { ...jsonLd, ...item };
          }
        }
      }
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item['@type'] && relevantTypes.some(t => (item['@type'] || '').includes(t))) {
            jsonLd = { ...jsonLd, ...item };
          }
        }
      }
    } catch { /* ignore */ }
  });

  // Title & Description
  result.name = jsonLd.name || $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  result.description = jsonLd.description || $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

  // --- Images ---
  const ogImg = $('meta[property="og:image"]').attr('content');
  if (ogImg) result.images.push(ogImg);
  if (jsonLd.image) {
    const imgs = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image];
    for (const img of imgs) {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && isValidPropertyImage(url)) result.images.push(url);
    }
  }
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('data-original-uri');
    if (src && isValidPropertyImage(src)) result.images.push(src);
    const srcset = $(el).attr('srcset');
    if (srcset) {
      const urls = srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(u => u.startsWith('http'));
      if (urls.length > 0) result.images.push(urls[urls.length - 1]); // highest res
    }
  });
  $('picture source').each((_, el) => {
    const srcset = $(el).attr('srcset');
    if (srcset) {
      const urls = srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(u => u.startsWith('http'));
      urls.forEach(u => result.images.push(u));
    }
  });
  // Deep scan for image URLs in scripts
  const imgUrlRegex = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;
  const scriptImgs = html.substring(0, 300000).match(imgUrlRegex) || [];
  for (const img of scriptImgs) {
    if (isValidPropertyImage(img)) result.images.push(img);
  }

  // --- Address ---
  result.address = { city: '', country: '', neighborhood: '', state: '', full_address: '' };
  if (jsonLd.address) {
    if (typeof jsonLd.address === 'object') {
      result.address.city = jsonLd.address.addressLocality || '';
      result.address.country = jsonLd.address.addressCountry || '';
      result.address.state = jsonLd.address.addressRegion || '';
      result.address.neighborhood = '';
      result.address.full_address = [jsonLd.address.streetAddress, jsonLd.address.addressLocality, jsonLd.address.addressRegion, jsonLd.address.postalCode, jsonLd.address.addressCountry].filter(Boolean).join(', ');
      result.address.postalCode = jsonLd.address.postalCode || '';
    } else {
      result.address.full_address = jsonLd.address;
    }
  }

  // --- Geo ---
  result.location = { latitude: 0, longitude: 0 };
  if (jsonLd.geo) {
    result.location.latitude = Number(jsonLd.geo.latitude) || 0;
    result.location.longitude = Number(jsonLd.geo.longitude) || 0;
  }

  // --- Price ---
  if (jsonLd.priceRange) {
    const numMatch = jsonLd.priceRange.match(/[\d,.]+/);
    if (numMatch) result.price = { amount: parseFloat(numMatch[0].replace(/,/g, '')), currency: detectCurrency(jsonLd.priceRange) };
  } else if (jsonLd.price) {
    result.price = { amount: Number(jsonLd.price), currency: jsonLd.priceCurrency || 'USD' };
  } else if (jsonLd.offers) {
    const offer = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
    if (offer?.price) result.price = { amount: Number(offer.price), currency: offer.priceCurrency || 'USD' };
  }

  // --- Specs ---
  result.specs = {
    maxGuests: Number(jsonLd.occupancy?.maxValue) || Number(jsonLd.occupancy?.value) || 2,
    bedrooms: Number(jsonLd.numberOfRooms) || Number(jsonLd.numberOfBedrooms) || 1,
    beds: Number(jsonLd.numberOfBeds) || 1,
    bathrooms: Number(jsonLd.numberOfBathroomsTotal) || 1,
  };

  // --- Amenities ---
  if (jsonLd.amenityFeature) {
    const features = Array.isArray(jsonLd.amenityFeature) ? jsonLd.amenityFeature : [jsonLd.amenityFeature];
    for (const f of features) {
      const name = typeof f === 'string' ? f : f?.name;
      if (name) result.amenities.push(name);
    }
  }
  result.amenities = [...new Set(result.amenities)].slice(0, 30);

  // --- Check-in / Check-out ---
  result.checkIn = jsonLd.checkinTime || '';
  result.checkOut = jsonLd.checkoutTime || '';

  // --- Host ---
  const host = jsonLd.author || jsonLd.provider || {};
  result.host = {
    name: typeof host === 'string' ? host : host?.name || '',
    isSuperhost: false,
  };

  // --- Property Type ---
  result.propertyType = inferPropertyTypeFromText(
    `${jsonLd['@type'] || ''} ${result.name} ${result.description}`.toLowerCase()
  );

  // --- Rating ---
  if (jsonLd.aggregateRating) {
    result.rating = Number(jsonLd.aggregateRating.ratingValue) || undefined;
    result.reviewCount = Number(jsonLd.aggregateRating.reviewCount) || undefined;
  }
  if (jsonLd.starRating) {
    result.starRating = Number(jsonLd.starRating.ratingValue || jsonLd.starRating) || undefined;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared utility functions
// ─────────────────────────────────────────────────────────────────────────────
function inferPropertyTypeFromText(text: string): string {
  if (text.includes('villa')) return 'villa';
  if (text.includes('resort')) return 'resort';
  if (text.includes('hostel')) return 'hostel';
  if (text.includes('guesthouse') || text.includes('guest house')) return 'guesthouse';
  if (text.includes('bed and breakfast') || text.includes('b&b') || text.includes('bedandbreakfast')) return 'bed_and_breakfast';
  if (text.includes('lodge')) return 'lodge';
  if (text.includes('motel')) return 'motel';
  if (text.includes('boutique hotel') || text.includes('boutiquehotel')) return 'boutique_hotel';
  if (text.includes('cabin') || text.includes('cottage') || text.includes('chalet')) return 'cabin';
  if (text.includes('townhouse') || text.includes('town house')) return 'townhouse';
  if (text.includes('apartment') || text.includes('flat') || text.includes('condo') || text.includes('loft') || text.includes('studio') || text.includes('cobertura') || text.includes('apartamento')) return 'apartment';
  if (text.includes('vacation rental') || text.includes('vacationrental') || text.includes('casa') || text.includes('house') || text.includes('home') || text.includes('entire home')) return 'vacation_rental';
  if (text.includes('hotel')) return 'hotel';
  if (text.includes('room') || text.includes('private room')) return 'apartment';
  return 'apartment';
}

function detectCurrency(text: string): string {
  const sym: Record<string, string> = { '$': 'USD', 'R$': 'BRL', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR', '₩': 'KRW', '฿': 'THB', 'zł': 'PLN', 'kr': 'SEK' };
  // Check for R$ first (before plain $)
  if (text.includes('R$')) return 'BRL';
  for (const [symbol, code] of Object.entries(sym)) {
    if (text.includes(symbol)) return code;
  }
  const codeMatch = text.match(/\b([A-Z]{3})\b/);
  if (codeMatch) return codeMatch[1];
  return 'USD';
}

function extractNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

function normalizeTime(time: string): string {
  const match = time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return time;
  let hours = parseInt(match[1]);
  const minutes = match[2] || '00';
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.time('[import] Total');

    // Detect platform and normalize URL
    const platform = detectPlatform(url);
    url = normalizeUrl(url, platform);
    console.log(`[import] Platform: ${platform}, URL: ${url}`);

    // ── Fetch HTML with 15s timeout ──
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="125", "Not.A/Brand";v="24", "Google Chrome";v="125"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(`[import] Fetch failed: ${res.status}`);
        return NextResponse.json({ error: `Failed to fetch URL (Status: ${res.status})` }, { status: 400 });
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout (15s limit)' }, { status: 408 });
      }
      console.error('[import] Fetch Error:', e.message);
      return NextResponse.json({ error: 'Failed to access URL' }, { status: 400 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(`[import] HTML size: ${(html.length / 1024).toFixed(0)}KB`);

    // ── Platform-specific extraction ──
    let extracted: any = null;

    switch (platform) {
      case 'airbnb':
        extracted = extractAirbnbData(html, $);
        break;
      case 'booking':
        extracted = extractBookingData(html, $);
        break;
      case 'vrbo':
        extracted = extractVrboData(html, $);
        break;
      case 'generic':
        extracted = extractGenericData(html, $);
        break;
    }

    // ── Deduplicate and limit images ──
    if (extracted?.images) {
      extracted.images = dedupeImages(extracted.images).slice(0, 50);
    }

    // ── Check quality: if we got a solid extraction, return fast path ──
    const hasGoodData = extracted
      && extracted.name
      && extracted.description && extracted.description.length > 20
      && extracted.images && extracted.images.length >= 1;

    if (hasGoodData) {
      console.log(`[import] FAST PATH: ${platform} extraction successful`);
      console.timeEnd('[import] Total');
      return NextResponse.json({
        success: true,
        data: extracted,
        source: `fast-path-${platform}`,
      });
    }

    // ── AI Fallback — for sites where extraction was insufficient ──
    console.log(`[import] Fast path insufficient (name=${!!extracted?.name}, desc=${(extracted?.description || '').length}ch, imgs=${extracted?.images?.length || 0}). Using AI...`);

    // Clean HTML for text extraction (AFTER platform extractors ran on raw HTML)
    const $clean = cheerio.load(html);
    $clean('script').remove();
    $clean('style').remove();
    $clean('svg').remove();
    $clean('iframe').remove();
    $clean('noscript').remove();
    $clean('.ad').remove();

    const metaTags = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    };

    const bodyText = $clean('body').text().replace(/\s+/g, ' ').trim().substring(0, 12000);

    // Merge any partial extracted data into the AI context
    const partialData = extracted ? JSON.stringify({
      name: extracted.name,
      specs: extracted.specs,
      amenities: extracted.amenities?.slice(0, 10),
      price: extracted.price,
      address: extracted.address,
    }).substring(0, 3000) : 'none';

    const prompt = `You are an AI Property Extraction Engine for a travel booking platform. Extract ALL available structured data from the provided content.

Target URL: ${url}
Platform: ${platform}

EXTRACT (return strict JSON only, no markdown):
{
  "name": "Property Title (string)",
  "description": "Full detailed description (string, at least 2-3 sentences)",
  "propertyType": "hotel|apartment|villa|resort|boutique_hotel|bed_and_breakfast|hostel|cabin|vacation_rental|guesthouse|townhouse",
  "address": {
    "city": "string",
    "country": "string (full name)",
    "state": "string",
    "neighborhood": "string",
    "full_address": "string (street, city, state, country)",
    "postalCode": "string"
  },
  "specs": {
    "bedrooms": "number (default 1)",
    "bathrooms": "number (default 1)",
    "maxGuests": "number (default 2)",
    "beds": "number (default 1)"
  },
  "price": { "amount": "number (per night)", "currency": "string (ISO code)" },
  "amenities": ["string[] (all detected, up to 25)"],
  "host": { "name": "string", "isSuperhost": "boolean" },
  "houseRules": ["string[]"],
  "checkIn": "HH:MM (24h format)",
  "checkOut": "HH:MM (24h format)",
  "starRating": "number or null"
}

CONTEXT:
1. Partial extraction data: ${partialData}
2. Meta Tags: ${JSON.stringify(metaTags)}
3. Page Text: "${bodyText}"

RULES:
- Use ONLY data found in the context. Do NOT invent or hallucinate.
- If a field cannot be determined, use the defaults or empty string/null.
- For price, only provide if you see an actual number. Do NOT guess.
- Output valid JSON only. No markdown wrapping.`;

    const aiRes = await callGroq([
      { role: 'system', content: 'You are a precise data extractor. Output valid JSON only. Never invent data.' },
      { role: 'user', content: prompt },
    ], {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.05,
      maxTokens: 2048,
    });

    if (!aiRes.success || !aiRes.message) {
      // If AI fails but we have partial data, return that
      if (extracted?.name) {
        console.log('[import] AI failed but returning partial extraction');
        console.timeEnd('[import] Total');
        return NextResponse.json({ success: true, data: extracted, source: `partial-${platform}` });
      }
      throw new Error('AI Processing Failed');
    }

    let jsonData;
    try {
      const cleanJson = aiRes.message.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      jsonData = JSON.parse(cleanJson);
    } catch {
      console.error('[import] AI JSON parse failed:', aiRes.message?.substring(0, 200));
      if (extracted?.name) {
        console.timeEnd('[import] Total');
        return NextResponse.json({ success: true, data: extracted, source: `partial-${platform}` });
      }
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Merge AI result with any images from platform extraction (AI can't see images)
    if (extracted?.images?.length) {
      jsonData.images = dedupeImages([...(extracted.images || []), ...(jsonData.images || [])]).slice(0, 50);
    } else {
      // Fallback: extract images from HTML using generic method
      const fallbackImages: string[] = [];
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) fallbackImages.push(ogImage);
      const imgRegex = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;
      const imgMatches = html.substring(0, 300000).match(imgRegex) || [];
      for (const img of imgMatches) {
        if (isValidPropertyImage(img)) fallbackImages.push(img);
      }
      jsonData.images = dedupeImages(fallbackImages).slice(0, 50);
    }

    // Merge platform-specific data that AI may have missed
    if (extracted) {
      if (!jsonData.location && extracted.location) jsonData.location = extracted.location;
      if ((!jsonData.specs || jsonData.specs.maxGuests <= 2) && extracted.specs?.maxGuests > 2) jsonData.specs = extracted.specs;
      if ((!jsonData.amenities || jsonData.amenities.length === 0) && extracted.amenities?.length > 0) jsonData.amenities = extracted.amenities;
      if (!jsonData.price && extracted.price) jsonData.price = extracted.price;
      if ((!jsonData.houseRules || jsonData.houseRules.length === 0) && extracted.houseRules?.length > 0) jsonData.houseRules = extracted.houseRules;
      if (!jsonData.checkIn && extracted.checkIn) jsonData.checkIn = extracted.checkIn;
      if (!jsonData.checkOut && extracted.checkOut) jsonData.checkOut = extracted.checkOut;
    }

    console.timeEnd('[import] Total');
    return NextResponse.json({
      success: true,
      data: jsonData,
      source: `ai-${platform}`,
    });

  } catch (error: any) {
    console.error('[import] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
