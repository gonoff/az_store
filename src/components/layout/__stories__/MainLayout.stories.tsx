import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MainLayout } from '../MainLayout';
import { Container } from '../Container';

const meta: Meta<typeof MainLayout> = {
  title: 'Layout/MainLayout',
  component: MainLayout,
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

const SampleContent = () => (
  <Container>
    <div className="py-16">
      <h1 className="text-4xl font-bold text-foreground">Sample Page Title</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This is sample content inside the MainLayout component. The layout provides a consistent
        header and footer across all pages.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-muted p-6">
            <h3 className="font-semibold">Card {i}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sample card content to demonstrate layout spacing.
            </p>
          </div>
        ))}
      </div>
    </div>
  </Container>
);

export const Default: Story = {
  args: {
    locale: 'en',
    cartItemCount: 0,
    children: <SampleContent />,
  },
};

export const WithCartItems: Story = {
  args: {
    locale: 'en',
    cartItemCount: 5,
    children: <SampleContent />,
  },
};

export const Portuguese: Story = {
  args: {
    locale: 'pt',
    cartItemCount: 2,
    children: <SampleContent />,
  },
  globals: {
    locale: 'pt',
  },
};

export const MinimalContent: Story = {
  args: {
    locale: 'en',
    cartItemCount: 0,
    children: (
      <Container>
        <div className="py-32 text-center">
          <p className="text-muted-foreground">Minimal content to show footer pushing to bottom.</p>
        </div>
      </Container>
    ),
  },
};
