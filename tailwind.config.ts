// tailwind.config.ts
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme'; // To access default theme values
import colors from 'tailwindcss/colors'; // To access default colors if needed

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // If using App Router
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans], // Example of extending font family
      },
      colors: {
        'custom-black': '#051014',
        'brand-primary': '#FF6347',
        'midnight-blue': '#191970',
        // Example of using a default color shade
        'cool-gray': colors.slate, // Make sure 'coolGray' is available or use another like 'slate', 'zinc' etc.
                                   // Note: some color names in `tailwindcss/colors` might have changed or been updated.
                                   // Check the version of Tailwind you are using.
                                   // For newer versions, it might be e.g. colors.slate['500']
      },
      // You can extend other theme properties here
      // spacing: {
      //   '128': '32rem',
      // },
    },
    // If you want to completely override a part of the theme (not just extend)
    // For example, to ONLY have your custom colors and not Tailwind's defaults for a category:
    // colors: {
    //   'custom-black': '#1A1A1A',
    //   'brand-primary': '#FF6347',
    //   // No other colors would be available unless explicitly defined or imported here
    // }
  },
  plugins: [
    // require('@tailwindcss/forms'), // Example of adding a plugin
  ],
};

export default config;