import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Footer } from '../Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'select',
      options: ['en', 'pt'],
      description: 'Current locale',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locale: 'en',
  },
};

export const Portuguese: Story = {
  args: {
    locale: 'pt',
  },
  globals: {
    locale: 'pt',
  },
};

export const MobileView: Story = {
  args: {
    locale: 'en',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
