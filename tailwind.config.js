/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './index.web.js',
    './public/index.html',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  safelist: [
    // Title Types for English and Persian
    'en_title1',
    'en_title2',
    'en_title3',
    'en_title4',
    'fa_title1',
    'fa_title2',
    'fa_title3',
    'fa_title4',

    // Subtitle Types for English and Persian
    'en_subtitle1',
    'en_subtitle2',
    'en_subtitle3',
    'fa_subtitle1',
    'fa_subtitle2',
    'fa_subtitle3',

    // Button Types for English and Persian
    'en_button1',
    'en_button2',
    'fa_button1',
    'fa_button2',

    // Body Types for English and Persian
    'en_body1',
    'en_body2',
    'en_body3',
    'fa_body1',
    'fa_body2',
    'fa_body3',

    // Caption, Placeholder, and Badge Types for English and Persian
    'en_caption',
    'en_placeholder',
    'en_badge',
    'fa_caption',
    'fa_placeholder',
    'fa_badge',

    'bg-primary-500',
    'bg-secondary-500',
    'bg-warning-500',
    'bg-success-500',
    'bg-error-500',
    // Text Colors for Light and Dark Themes
    'text-text-base',
    'text-text-secondary',
    'text-text-muted',
    'text-text-active',
    'text-text-warning',
    'text-text-success',
    'text-text-error',
    'text-text-button',
    'text-text-Success600',
    'text-text-Success500',
    'text-text-Primary600',
    'text-text-secondaryPurple',
    'text-text-supportive1',
    'text-text-supportive2',
    'text-text-supportive3',
    'text-text-supportive4',
    'text-text-supportive5',
    'text-text-supportive6',

    'text-text-tonal-dark',
    'text-text-base-dark',
    'text-text-secondary-dark',
    'text-text-muted-dark',
    'text-text-active-dark',
    'text-text-warning-dark',
    'text-text-success-dark',
    'text-text-error-dark',
    'text-text-button-dark',
    'text-text-Success600-dark',
    'text-text-Success500-dark',
    'text-text-Primary600-dark',
    'text-text-secondaryPurple-dark',
    'text-text-supportive1-dark',
    'text-text-supportive2-dark',
    'text-text-supportive3-dark',
    'text-text-supportive4-dark',
    'text-text-supportive5-dark',
    'text-text-supportive6-dark',

    'Fill-Primary',
    'Fill-Black',
    'Fill-Success',
    'Tonal-Primary',
    'Tonal-Black',
    'Tonal-Success',
    'Outline-Primary',
    'Outline-Black',
    'Outline-Success',
    'TextButton-Primary',
    'TextButton-Black',
    'TextButton-Success',
  ],

  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins-Regular', 'Poppins-Bold', 'Poppins-SemiBold'],
        yekan: [
          'YekanBakhFaNum-Regular',
          'YekanBakhFaNum-Bold',
          'YekanBakhFaNum-SemiBold',
        ],
      },
      colors: {
        // Neutral Colors
        neutral: {
          0: '#ffffff',
          100: '#f4f4f5',
          200: '#e4e4e8',
          300: '#d4d5d6',
          400: '#aaabad',
          500: '#717181',
          600: '#55575c',
          700: '#2a2d33',
          800: '#232529',
          900: '#1b1d21',
          1000: '#16181b',
          dark: {
            0: '#16181b',
            100: '#1b1d21',
            200: '#232529',
            300: '#2a2d33',
            400: '#55575c',
            500: '#7f8185',
            600: '#aaabad',
            700: '#d4d5d6',
            800: '#eaeaeb',
            900: '#f4f4f5',
            1000: '#ffffff',
          },
        },
        // Primary Colors
        primary: {
          100: '#eaf4cf',
          200: '#e0efb8',
          300: '#d2e897',
          400: '#c9e483',
          500: '#bcdc64', // Base
          600: '#abc95b',
          700: '#859d47',
          dark: {
            100: '#4f5d2a',
            200: '#677c37',
            300: '#859d47',
            400: '#abc95b',
            500: '#bcdc64', // Base
            600: '#c9e483',
            700: '#d2e897',
          },
        },
        // Secondary Colors
        secondary: {
          100: '#d5d5fa',
          200: '#c0c0f7',
          300: '#a3a3f4',
          400: '#9191f1',
          500: '#7676ee', // Base
          600: '#6b6bd9',
          700: '#5454a9',
          dark: {
            100: '#332864',
            200: '#414183',
            300: '#5454a9',
            400: '#6b6bd9',
            500: '#7676ee', // Base
            600: '#9191f1',
            700: '#a3a3f4',
          },
        },
        // Warning Colors
        warning: {
          100: '#ffddc0',
          200: '#ffcc92',
          300: '#ffb577',
          400: '#ffa75d',
          500: '#ff9134', // Base
          600: '#e8842f',
          700: '#b56725',
          dark: {
            100: '#6b3d16',
            200: '#8c501d',
            300: '#b56725',
            400: '#e8842f',
            500: '#ff9134', // Base
            600: '#ffa75d',
            700: '#ffb577',
          },
        },
        // Error Colors
        error: {
          100: '#fec9cb',
          200: '#fea6ae',
          300: '#fe8a89',
          400: '#fd7372',
          500: '#fd504f', // Base
          600: '#e64948',
          700: '#b43938',
          dark: {
            100: '#6a3221',
            200: '#8b2c2b',
            300: '#b43938',
            400: '#e64948',
            500: '#fd504f', // Base
            600: '#fd7372',
            700: '#fe8a89',
          },
        },
        // Success Colors
        success: {
          50: '#EBFAF1',
          100: '#C1EED5',
          200: '#A3E6C0',
          300: '#79DBA3',
          400: '#5FD491',
          500: '#37C976', // Base
          600: '#32B76B',
          700: '#278F54',
          dark: {
            50: '#124629',
            100: '#175432',
            200: '#1E6F41',
            300: '#278F54',
            400: '#32B76B',
            500: '#37C976', // Base
            600: '#5FD491',
            700: '#79DBA3',
          },
        },
        // Supportive1-Yellow Colors
        supportive1: {
          100: '#fff1d5',
          200: '#ffebc0',
          300: '#fee2a3',
          400: '#fedc91',
          500: '#fed376', // Base
          600: '#e7c06b',
          700: '#b49654',
          dark: {
            100: '#6b5932',
            200: '#8c7441',
            300: '#b49654',
            400: '#e7c06b',
            500: '#fed376', // Base
            600: '#fedc91',
            700: '#fee2a3',
          },
        },
        // Supportive2-Purple Colors
        supportive2: {
          100: '#e7dbee',
          200: '#dccae6',
          300: '#cbb1db',
          400: '#c1a2d4',
          500: '#b28bc9', // Base
          600: '#a27be7',
          700: '#7e638f',
          dark: {
            100: '#4b3e54',
            200: '#624e6f',
            300: '#7e638f',
            400: '#a27be7',
            500: '#b28bc9', // Base
            600: '#c1a2d4',
            700: '#cbb1db',
          },
        },
        // Supportive3-Pink Colors
        supportive3: {
          100: '#ffc7d4',
          200: '#ffacbf',
          300: '#ff86a2',
          400: '#ff6e90',
          500: '#ff4a74', // Base
          600: '#e8436a',
          700: '#b53552',
          dark: {
            100: '#6b1f31',
            200: '#8c2940',
            300: '#b53552',
            400: '#e8436a',
            500: '#ff4a74', // Base
            600: '#ff6e90',
            700: '#ff86a2',
          },
        },
        // Supportive4-Dark Blue Colors
        supportive4: {
          100: '#b6bcf2',
          200: '#929cce',
          300: '#616ee4',
          400: '#4252de',
          500: '#1327d6', // Base
          600: '#1123c3',
          700: '#0d1c98',
          dark: {
            100: '#08105a',
            200: '#0a1578',
            300: '#0d1c98',
            400: '#1123c3',
            500: '#1327d6', // Base
            600: '#4252de',
            700: '#616ee4',
          },
        },
        // Supportive5-Light Blue Colors
        supportive5: {
          100: '#cceeff',
          200: '#b4e6ff',
          300: '#91daff',
          400: '#7cd3ff',
          500: '#5bc8ff', // Base
          600: '#53b6e8',
          700: '#418eb5',
          dark: {
            100: '#26546b',
            200: '#326e8c',
            300: '#418eb5',
            400: '#53b6e8',
            500: '#5bc8ff', // Base
            600: '#7cd3ff',
            700: '#91daff',
          },
        },
        // Supportive6-Turquoise Blue Colors
        supportive6: {
          100: '#b4f8e5',
          200: '#90f4d8',
          300: '#5defc6',
          400: '#dcebb',
          500: '#0de7aa', // Base
          600: '#0cd29b',
          700: '#09a479',
          dark: {
            100: '#065147',
            200: '#077f56',
            300: '#09a479',
            400: '#0cd29b',
            500: '#0de7aa', // Base
            600: '#3decb5',
            700: '#5defc6',
          },
        },
        text: {
          base: {
            DEFAULT: '#16181b', // Light - Neutral-1000
            dark: '#ffffff', // Dark - Neutral-1000
          },
          secondary: {
            DEFAULT: '#55575c', // Light - Neutral-600
            dark: '#AAABAD', // Dark - Neutral-600
          },
          muted: {
            DEFAULT: '#aaabad', // Light - Neutral-400
            dark: '#4d4d50', // Dark - Neutral-400
          },
          active: {
            DEFAULT: '#bcdc64', // Light - Primary-500
            dark: '#8ac14f', // Dark - Primary-500
          },
          warning: {
            DEFAULT: '#ff9134', // Light - Warning-500
            dark: '#ff7a1a', // Dark - Warning-500
          },
          success: {
            DEFAULT: '#32b76b', // Light - Success-500
            dark: '#28a35c', // Dark - Success-500
          },
          error: {
            DEFAULT: '#fd504f', // Light - Error-500
            dark: '#e04a4a', // Dark - Error-500
          },
          button: {
            DEFAULT: '#ffffff', // Light - Neutral-0
            dark: '#16181b', // Dark - Neutral-0
          },
          Primary600: {
            DEFAULT: '#abc95b', // Light - Primary600
            dark: '#c9e483', // Dark - Primary600
          },
          Success600: {
            DEFAULT: '#32b76b', // Light - Success600
            dark: '#5fd491', // Dark - Success600
          },
          Success500: {
            DEFAULT: '#37c976', // Light - Success
            dark: '#37c976', // Dark - Success
          },
          secondaryPurple: {
            DEFAULT: '#7676ee', // Light - Success
            dark: '#7676ee', // Dark - Success
          },
          supportive1: {
            DEFAULT: '#fed376', // Light - Success
            dark: '#fed376', // Dark - Success
          },
          supportive2: {
            DEFAULT: '#b28bc9', // Light - Success
            dark: '#b28bc9', // Dark - Success
          },
          supportive3: {
            DEFAULT: '#ff4a74', // Light - Success
            dark: '#ff4a74', // Dark - Success
          },
          supportive4: {
            DEFAULT: '#1327d6', // Light - Success
            dark: '#1327d6', // Dark - Success
          },
          supportive5: {
            DEFAULT: '#5bc8ff', // Light - Success
            dark: '#5bc8ff', // Dark - Success
          },
          supportive6: {
            DEFAULT: '#0de7aa', // Light - Success
            dark: '#0de7aa', // Dark - Success
          },
        },
        // Background Colors
        bg: {
          base: {
            DEFAULT: '#ffffff', // Light - Neutral-0
            dark: '#16181b', // Dark - Neutral-0
          },
          secondary: {
            DEFAULT: '#f4f4f5', // Light - Neutral-100
            dark: '#232529', // Dark - Neutral-100
          },
        },
        // Icon Colors
        icon: {
          base: {
            DEFAULT: '#717181', // Light - Neutral-500
            dark: '#d4d5d6', // Dark - Neutral-500
          },
          secondary: {
            DEFAULT: '#d4d5d6', // Light - Neutral-300
            dark: '#717181', // Dark - Neutral-300
          },
          active: {
            DEFAULT: '#bcdc64', // Light - Primary-500
            dark: '#8ac14f', // Dark - Primary-500
          },
        },
      },
    },
  },
  plugins: [],
};
