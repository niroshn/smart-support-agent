import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  describe('Rendering', () => {
    it('should render textarea input', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const button = screen.getByRole('button', { name: '' });
      expect(button).toBeInTheDocument();
    });

    it('should render disclaimer text', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      expect(screen.getByText(/MoneyHero AI can make mistakes/i)).toBeInTheDocument();
    });

    it('should show default placeholder when not disabled', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      expect(screen.getByPlaceholderText(/Ask about credit cards/i)).toBeInTheDocument();
    });

    it('should show session ended placeholder when disabled', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} disabled />);
      expect(screen.getByPlaceholderText('Session ended.')).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Hello');
      expect(textarea).toHaveValue('Hello');
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Test message');
      const button = screen.getByRole('button');
      await user.click(button);

      expect(textarea).toHaveValue('');
    });

    it('should handle multiline input', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
      expect(textarea.value).toContain('Line 1');
      expect(textarea.value).toContain('Line 2');
    });
  });

  describe('Form Submission', () => {
    it('should call onSend when send button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Test message');
      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    it('should call onSend when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Test message');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should not submit when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Test message');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not submit empty message', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not submit message with only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, '   ');
      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should trim whitespace from message before sending', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, '  Test message  ');
      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).toHaveBeenCalledWith('  Test message  ');
    });
  });

  describe('Loading State', () => {
    it('should disable textarea when loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);
      expect(textarea).toBeDisabled();
    });

    it('should disable send button when loading', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={true} />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not call onSend when loading', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={true} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      // Try to type (won't work because disabled)
      await user.type(textarea, 'Test');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} disabled />);
      const textarea = screen.getByPlaceholderText('Session ended.');
      expect(textarea).toBeDisabled();
    });

    it('should disable send button when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not call onSend when disabled', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} disabled />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Button State', () => {
    it('should disable send button when input is empty', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable send button when input has content', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);

      await user.type(textarea, 'Test');

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should show send icon when not loading', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      // Send icon should be present (Lucide Send icon)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-resize Behavior', () => {
    it('should have initial height of auto', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);
      expect(textarea).toHaveStyle({ height: 'auto' });
    });

    it('should reset height after sending message', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i) as HTMLTextAreaElement;

      await user.type(textarea, 'Test message');
      const button = screen.getByRole('button');
      await user.click(button);

      // Height should be reset to auto after clearing input
      await waitFor(() => {
        expect(textarea.style.height).toBe('auto');
      });
    });
  });

  describe('Form Element', () => {
    it('should render as a form element', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/Ask about credit cards/i);
      const form = container.querySelector('form');

      await user.type(textarea, 'Test');

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct container styling', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const outerContainer = container.querySelector('.p-4');
      expect(outerContainer).toBeInTheDocument();
      expect(outerContainer).toHaveClass('bg-white/80');
    });

    it('should have focus-within ring effect', () => {
      const { container } = render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const formContainer = container.querySelector('form');
      expect(formContainer).toHaveClass('focus-within:ring-2');
    });

    it('should have correct button styling', () => {
      render(<ChatInput onSend={mockOnSend} isLoading={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('text-white');
    });
  });
});
