import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Container } from '../Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'section', 'main', 'article'],
      description: 'HTML element to render',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="bg-primary/10 p-8 text-center">
        <p className="text-foreground">
          Content inside the container with max-width and responsive padding.
        </p>
      </div>
    ),
  },
};

export const AsSection: Story = {
  args: {
    as: 'section',
    children: (
      <div className="bg-muted p-8">
        <h2 className="text-xl font-bold">Section Container</h2>
        <p className="mt-2 text-muted-foreground">Rendered as a semantic section element.</p>
      </div>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'py-12',
    children: (
      <div className="bg-primary text-primary-foreground p-8 rounded-lg">
        <p>Container with additional vertical padding.</p>
      </div>
    ),
  },
};

export const FullWidthComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-destructive/20 p-4">
        <p className="text-center">Full width (no container)</p>
      </div>
      <Container>
        <div className="bg-primary/20 p-4">
          <p className="text-center">Inside container (max-w-7xl with responsive padding)</p>
        </div>
      </Container>
    </div>
  ),
};
