import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Header } from '../Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
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
    cartItemCount: {
      control: { type: 'number', min: 0, max: 150 },
      description: 'Number of items in cart',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locale: 'en',
    cartItemCount: 0,
  },
};

export const WithCartItems: Story = {
  args: {
    locale: 'en',
    cartItemCount: 3,
  },
};

export const ManyCartItems: Story = {
  args: {
    locale: 'en',
    cartItemCount: 150,
  },
};

export const Portuguese: Story = {
  args: {
    locale: 'pt',
    cartItemCount: 2,
  },
  globals: {
    locale: 'pt',
  },
};

export const MobileView: Story = {
  args: {
    locale: 'en',
    cartItemCount: 5,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
