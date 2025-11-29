import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LanguageSwitcher } from '../LanguageSwitcher';

const meta: Meta<typeof LanguageSwitcher> = {
  title: 'Common/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentLocale: {
      control: 'select',
      options: ['en', 'pt'],
      description: 'Current locale',
    },
    variant: {
      control: 'select',
      options: ['icon', 'text', 'full'],
      description: 'Display variant',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Dropdown alignment',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IconOnly: Story = {
  args: {
    currentLocale: 'en',
    variant: 'icon',
    align: 'end',
  },
};

export const TextOnly: Story = {
  args: {
    currentLocale: 'en',
    variant: 'text',
    align: 'end',
  },
};

export const Full: Story = {
  args: {
    currentLocale: 'en',
    variant: 'full',
    align: 'end',
  },
};

export const Portuguese: Story = {
  args: {
    currentLocale: 'pt',
    variant: 'full',
    align: 'end',
  },
  globals: {
    locale: 'pt',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">Icon</p>
        <LanguageSwitcher currentLocale="en" variant="icon" />
      </div>
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">Text</p>
        <LanguageSwitcher currentLocale="en" variant="text" />
      </div>
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">Full</p>
        <LanguageSwitcher currentLocale="en" variant="full" />
      </div>
    </div>
  ),
};
