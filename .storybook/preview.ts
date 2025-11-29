import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import * as React from 'react';
import '../src/app/globals.css';

// Import messages for storybook
import enMessages from '../src/messages/en.json';
import ptMessages from '../src/messages/pt.json';

const messages = {
  en: enMessages,
  pt: ptMessages,
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    nextjs: {
      appDirectory: true,
    },
  },
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'pt', title: 'Português' },
        ],
        showName: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      return React.createElement(
        NextIntlClientProvider,
        {
          locale,
          messages: messages[locale as keyof typeof messages],
        },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;
