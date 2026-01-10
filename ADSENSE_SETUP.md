# Google AdSense Setup Guide

## ✅ Implementation Complete

Google AdSense has been integrated into your site. Ads will appear at the bottom of all pages, above the footer.

## 📝 What Was Added

1. **AdSense Script Component** (`src/components/ads/AdSenseScript.tsx`)
   - Loads the Google AdSense script on all pages
   - Uses your publisher ID: `ca-pub-4357894821158922`

2. **Footer Ad Component** (`src/components/ads/FooterAd.tsx`)
   - Displays responsive ads at the bottom of pages
   - **ACTION REQUIRED:** Replace `YOUR_AD_SLOT_ID_HERE` with your actual ad slot ID

3. **Reusable Ad Component** (`src/components/ads/AdSenseAd.tsx`)
   - Generic component for placing ads anywhere on the site

## 🔧 Next Steps: Get Your Ad Slot ID

### Step 1: Create an Ad Unit in Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Navigate to **Ads** → **By ad unit** → **Display ads**
3. Click **+ New ad unit**
4. Fill in:
   - **Name:** "Footer Ad" (or any name you prefer)
   - **Ad format:** Select **Responsive (recommended)**
   - **Ad size:** Choose **Responsive** or specific sizes
5. Click **Create**

### Step 2: Get Your Ad Slot ID

After creating the ad unit, you'll see a code snippet like this:

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4357894821158922"
     data-ad-slot="1234567890"  ← This is your Ad Slot ID
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

### Step 3: Update FooterAd Component

1. Open `src/components/ads/FooterAd.tsx`
2. Find this line:
   ```tsx
   data-ad-slot="YOUR_AD_SLOT_ID_HERE"
   ```
3. Replace `YOUR_AD_SLOT_ID_HERE` with your actual ad slot ID (e.g., `"1234567890"`)
4. Save and deploy

## 📍 Ad Placement

Ads currently appear:
- **Location:** At the bottom of all pages, above the footer
- **Format:** Responsive (auto-adjusts to screen size)
- **Visibility:** All pages site-wide

## 🎨 Customization

### Change Ad Placement

To move ads to a different location, edit `src/components/home-v2/FooterV2.tsx` and move the `<FooterAd />` component.

### Add More Ads

To add ads elsewhere on the site, use the `AdSenseAd` component:

```tsx
import AdSenseAd from '@/components/ads/AdSenseAd';

<AdSenseAd 
  adSlot="YOUR_AD_SLOT_ID" 
  format="auto" 
  fullWidthResponsive={true} 
/>
```

### Multiple Ad Units

Create multiple ad units in AdSense for different placements:
- Footer ad (already implemented)
- Sidebar ad
- In-content ad
- etc.

## ⚠️ Important Notes

1. **AdSense Policies:** Make sure your site complies with [AdSense policies](https://support.google.com/adsense/answer/48182)
2. **Traffic Requirements:** Ads may not show immediately if your site is new or has low traffic
3. **Testing:** Use AdSense's "Test ad unit" feature to verify ads are working
4. **Performance:** Ads load asynchronously using Next.js Script component for optimal performance

## 🔍 Verification Checklist

- [ ] Created ad unit in Google AdSense
- [ ] Got your ad slot ID
- [ ] Updated `FooterAd.tsx` with your ad slot ID
- [ ] Deployed the changes
- [ ] Verified ads appear on your site (may take a few hours)
- [ ] Checked that ads don't overlap with content
- [ ] Ensured mobile responsiveness

## 📞 Support

If ads aren't showing:
1. Wait 24-48 hours after deployment (Google needs to crawl your site)
2. Check Google AdSense dashboard for any policy violations
3. Verify your ad slot ID is correct
4. Check browser console for any errors
5. Ensure your site has enough traffic (new sites may take time)

