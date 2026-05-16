import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your move has been executed successfully.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Invalid move. Please select a legal move.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This action cannot be undone.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Info',
    children: 'You have 3 power cards available.',
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    children: 'This is an alert without a title.',
  },
};

export const WithClose: Story = {
  args: {
    variant: 'info',
    title: 'Dismissible Alert',
    children: 'Click the X button to dismiss this alert.',
  },
  render: (args) => {
    const [show, setShow] = React.useState(true);
    return show ? (
      <Alert {...args} onClose={() => setShow(false)} />
    ) : (
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Show Alert
      </button>
    );
  },
};
