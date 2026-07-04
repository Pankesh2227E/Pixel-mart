/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'pixel-9-pro-xl',
    name: 'Google Pixel 9 Pro XL',
    price: 1099,
    category: 'Phones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
    colors: ['Porcelain', 'Obsidian', 'Hazel'],
    storages: ['128GB', '256GB', '512GB', '1TB'],
    rating: 4.9,
    reviewsCount: 124,
    isNew: true,
    highlights: [
      'Pro triple-camera system with upgraded lenses',
      'Advanced Google Tensor G4 with 16GB of RAM',
      'Super Actua display - our brightest ever, even in full sunlight',
      'Polished porcelain ceramic with beautiful satin metal accents'
    ],
    specs: {
      'Processor': 'Google Tensor G4 with Titan M2 security coprocessor',
      'Display': '6.8-inch Super Actua display (1344 x 2992), 120Hz refresh rate',
      'Main Camera': '50 MP wide, 48 MP ultrawide with Macro Focus, 48 MP 5x telephoto',
      'Front Camera': '42 MP with autofocus for ultra-crisp selfies',
      'Battery': 'Over 24-hour battery life. Up to 100 hours with Extreme Battery Saver',
      'Memory & Storage': '16 GB LPDDR5X RAM with options up to 1 TB',
      'Materials': 'Corning Gorilla Glass Victus 2 back with 100% recycled aluminum enclosure'
    }
  },
  {
    id: 'pixel-watch-3',
    name: 'Google Pixel Watch 3',
    price: 349,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
    colors: ['Porcelain', 'Matte Black', 'Hazel'],
    sizes: ['41mm', '45mm'],
    rating: 4.7,
    reviewsCount: 88,
    isNew: true,
    highlights: [
      'Stunning Actua AMOLED display with custom 3D Gorilla Glass',
      'Advanced fitness coaching with heart-rate and sleep profiles',
      'Loss of Pulse Detection - the first of its kind for security',
      'Seamless multi-device connection with Pixel ecosystem'
    ],
    specs: {
      'Display': 'Actua AMOLED display, up to 2000 nits, custom 3D Corning Gorilla Glass 5',
      'Battery': 'Up to 24 hours with always-on display, up to 36 hours in Saver mode',
      'Health Tracking': 'Built-in Fitbit fitness tracking, ECG, SpO2, Skin Temp, Readiness Score',
      'Connectivity': 'Wi-Fi, Bluetooth 5.3, GPS, NFC, optional 4G LTE',
      'Durability': '5 ATM water resistance (50 meters) and IP68 dust-resistant'
    }
  },
  {
    id: 'pixel-buds-pro-2',
    name: 'Google Pixel Buds Pro 2',
    price: 229,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    colors: ['Porcelain', 'Hazel', 'Wintergreen', 'Peony'],
    sizes: ['Standard Fit'],
    rating: 4.8,
    reviewsCount: 95,
    isBestSeller: true,
    highlights: [
      'Custom-designed Google Tensor A1 audio processing chip',
      'Silent Seal 2.0 Active Noise Cancellation - 2x stronger',
      'Twist-to-adjust stabilizer lock for the perfect sport grip',
      'Crystal-clear calls even in windy or noisy environments'
    ],
    specs: {
      'Audio Processor': 'Google Tensor A1 chip for ultra-low latency noise suppression',
      'Active Noise Control': 'Silent Seal 2.0 Active Noise Cancellation and dynamic Transparency mode',
      'Battery Life': 'Up to 12 hours with ANC off (30 hours total with case)',
      'Charging': 'Wireless charging (Qi-certified) and USB-C fast charge support',
      'Fit & Seal': 'Includes 4 ear tip sizes and twist-to-adjust stabilizing fin'
    }
  },
  {
    id: 'pixel-tablet',
    name: 'Google Pixel Tablet with Dock',
    price: 499,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    colors: ['Porcelain', 'Hazel', 'Rose'],
    storages: ['128GB', '256GB'],
    rating: 4.6,
    reviewsCount: 74,
    highlights: [
      'Includes beautiful matching Charging Speaker Dock',
      'Vibrant 11-inch screen ideal for streaming and home automation',
      'Hub Mode transforms the tablet into an interactive display when docked',
      'Tensor G2 power handles heavy multitasking easily'
    ],
    specs: {
      'Processor': 'Google Tensor G2 chip with Titan M2 security',
      'Display': '11-inch LCD screen, 2560 x 1600 resolution with stylus support',
      'Docking Station': 'Magnetic Charging Speaker Dock with premium room-filling audio',
      'Camera': 'Dual 8 MP front and rear cameras with 1080p recording',
      'Battery': 'Up to 12 hours of active video streaming'
    }
  },
  {
    id: 'pixel-9',
    name: 'Google Pixel 9',
    price: 799,
    category: 'Phones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    colors: ['Porcelain', 'Obsidian', 'Wintergreen', 'Peony'],
    storages: ['128GB', '256GB'],
    rating: 4.8,
    reviewsCount: 110,
    highlights: [
      'Vibrant 6.3-inch Actua display with 120Hz refresh',
      'New Google Tensor G4 with 12GB of RAM',
      'High-grade dual rear camera system with Macro Focus',
      'Polished porcelain back with durable satin metal frame'
    ],
    specs: {
      'Processor': 'Google Tensor G4 with Titan M2 security coprocessor',
      'Display': '6.3-inch Actua OLED display (1080 x 2424), up to 120Hz refresh rate',
      'Rear Camera': '50 MP wide, 48 MP ultrawide with Macro Focus',
      'Front Camera': '10.5 MP dual-pixel camera with autofocus',
      'Battery': 'Over 24-hour battery life. 55% charge in 30 minutes with fast charger',
      'Memory': '12 GB LPDDR5X RAM'
    }
  },
  {
    id: 'pixel-stand-2',
    name: 'Pixel Stand (2nd Gen)',
    price: 79,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&q=80&w=800',
    colors: ['White'],
    sizes: ['Standard'],
    rating: 4.5,
    reviewsCount: 61,
    highlights: [
      'Up to 23W fast wireless charging for compatible Pixel phones',
      'Whisper-quiet cooling fan allows fast charging without heat build-up',
      'Turns your Pixel phone into a stylish smart display with Hub controls',
      'Beautiful upright stand perfect for desks and nightstands'
    ],
    specs: {
      'Charging Speed': 'Up to 23W wireless charging for Pixel phones, up to 15W for standard Qi devices',
      'Cooling': 'Silent active fan system dynamically adjusts based on temperature',
      'Power Source': 'Includes 1.5m USB-C to USB-C cable and 30W USB-C power adapter',
      'Dimensions': '82 x 71.4 x 113.9 mm; Weight: 383 g'
    }
  }
];
