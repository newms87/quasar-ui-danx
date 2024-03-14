/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,vue}', '../src/**/*.{html,js,ts,vue}'],
  theme: {
    extend: {
      colors: {
        black: '#000',
        white: '#ffffff',
        neutral: {
          'plus-7': '#F3F4F7',
          'plus-6': '#EDEFF3',
          'plus-5': '#E0E4EB',
          'plus-4': '#CED3DE',
          'plus-3': '#A3ADC2',
          'base': '#525F7A',
          'on-plus-3': '#29303D'
        },
        gray: {
          cream: '#FAFAFA',
          'very-light': '#F9FAFB',
          light: '#E9E9E7',
          medium: '#C9CBCD',
          base: '#93959B',
          silver: '#72767C',
          default: '#6B7280',
          shadow: '#383C42',
          dark: '#272D36'
        },
        brown: {
          '': '#604315'
        },
        blue: {
          'plus-7': '#EBF6FF',
          'plus-6': '#E0F2FF',
          light: 'rgba(187, 226, 255, 0.5)',
          lighter: '#BBE2FF',
          'plus-1': '#0A99FF',
          base: '#0077CC',
          dark: '#0059aa',
          700: '#005B9D',
          'minus-3': '#00538F',
          darker: '#00406F',
          onplus2: '#003052'
        },
        yellow: {
          lighter: '#FFEDBD',
          light: '#FFDB7E',
          warning: '#FAB80F',
          base: '#EC9100',
          600: '#D97706'
        },
        green: {
          light: '#BFFFDE',
          'plus-4': '#A3FFDE',
          notice: '#00E090',
          medium: '#48D38A',
          'notice-minus-1': '#00B876',
          base: '#02AB52',
          dark: '#117641'
        },
        red: {
          light: '#FFDFDF',
          danger: '#EF4343',
          dark: '#850000'
        },
        purple: {
          light: '#F2CCFF',
          '': '#7900A4'
        }
      },
      borderWidth: {
        3: '3px'
      },
      dropShadow: {
        card: '0 1px 3px rgba(0,0,0,0.14)'
      },
      outlineWidth: {
        3: '3px'
      },
      minWidth: {
        sm: '320px'
      }
    }
  },
  plugins: []
};
