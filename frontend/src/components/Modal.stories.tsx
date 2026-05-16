import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-green-500 text-slate-950 rounded-lg font-semibold"
        >
          Open Modal
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
          <p className="text-slate-300 mb-4">Are you sure you want to proceed?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-green-500 text-slate-950 rounded-lg font-semibold hover:bg-green-400"
            >
              Confirm
            </button>
          </div>
        </Modal>
      </>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"
        >
          Open Modal
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-slate-300">Modal content without a title</p>
        </Modal>
      </>
    );
  },
};
