"use strict";
/**
 * ROUTES SITEMAP - /sitemaps/routes.xml
 * 50,000 flight route pages (Google max per sitemap)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.GET = GET;
var server_1 = require("next/server");
var sitemap_helpers_1 = require("@/lib/seo/sitemap-helpers");
exports.dynamic = 'force-static';
exports.revalidate = 86400;
var SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var today, urls, usAirports, intlAirports, i, j, origin_1, dest, slug, priority, _i, usAirports_1, origin_2, _a, intlAirports_1, dest, slug, _b, intlAirports_2, origin_3, _c, usAirports_2, dest, slug, topIntl, i, j, slug, xml;
        return __generator(this, function (_d) {
            today = new Date().toISOString().split('T')[0];
            urls = [];
            usAirports = sitemap_helpers_1.TOP_US_AIRPORTS;
            intlAirports = sitemap_helpers_1.TOP_INTERNATIONAL_AIRPORTS;
            // 1. US Domestic routes: 50 × 49 = 2,450 routes
            for (i = 0; i < usAirports.length; i++) {
                for (j = 0; j < usAirports.length; j++) {
                    if (i !== j) {
                        origin_1 = usAirports[i];
                        dest = usAirports[j];
                        slug = (0, sitemap_helpers_1.formatRouteSlug)(origin_1, dest);
                        priority = (0, sitemap_helpers_1.calculateRoutePriority)(origin_1, dest);
                        urls.push("  <url>\n    <loc>".concat(SITE_URL, "/flights/").concat(slug, "</loc>\n    <lastmod>").concat(today, "</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>").concat(priority.toFixed(1), "</priority>\n  </url>"));
                    }
                }
            }
            // 2. US to International: 50 × 50 = 2,500 routes
            for (_i = 0, usAirports_1 = usAirports; _i < usAirports_1.length; _i++) {
                origin_2 = usAirports_1[_i];
                for (_a = 0, intlAirports_1 = intlAirports; _a < intlAirports_1.length; _a++) {
                    dest = intlAirports_1[_a];
                    slug = (0, sitemap_helpers_1.formatRouteSlug)(origin_2, dest);
                    urls.push("  <url>\n    <loc>".concat(SITE_URL, "/flights/").concat(slug, "</loc>\n    <lastmod>").concat(today, "</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>"));
                }
            }
            // 3. International to US: 50 × 50 = 2,500 routes
            for (_b = 0, intlAirports_2 = intlAirports; _b < intlAirports_2.length; _b++) {
                origin_3 = intlAirports_2[_b];
                for (_c = 0, usAirports_2 = usAirports; _c < usAirports_2.length; _c++) {
                    dest = usAirports_2[_c];
                    slug = (0, sitemap_helpers_1.formatRouteSlug)(origin_3, dest);
                    urls.push("  <url>\n    <loc>".concat(SITE_URL, "/flights/").concat(slug, "</loc>\n    <lastmod>").concat(today, "</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>"));
                }
            }
            topIntl = intlAirports.slice(0, 30);
            for (i = 0; i < topIntl.length; i++) {
                for (j = 0; j < topIntl.length; j++) {
                    if (i !== j) {
                        slug = (0, sitemap_helpers_1.formatRouteSlug)(topIntl[i], topIntl[j]);
                        urls.push("  <url>\n    <loc>".concat(SITE_URL, "/flights/").concat(slug, "</loc>\n    <lastmod>").concat(today, "</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>"));
                    }
                }
            }
            xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n".concat(urls.join('\n'), "\n</urlset>");
            return [2 /*return*/, new server_1.NextResponse(xml, {
                    headers: {
                        'Content-Type': 'application/xml',
                        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    },
                })];
        });
    });
}
